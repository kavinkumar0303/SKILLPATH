"""
Skillpath - Resume Builder Routes
Assembles ATS-compliant resumes strictly from verified user profile and learning data.
"""
import json
import io
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from db import get_session, User, ResumeVersion, CareerGoal
from auth import get_current_user, get_db
from agents.orchestrator import OrchestratorAgent
from agents.resume_agent import ResumeAgent

router = APIRouter(prefix="/api/resume", tags=["Resume Builder"])
orchestrator = OrchestratorAgent()
resume_agent = ResumeAgent()

class GenerateResumeRequest(BaseModel):
    role_id: Optional[str] = None
    template: Optional[str] = "modern"

class SaveResumeRequest(BaseModel):
    resume_data: dict

class CreateVersionRequest(BaseModel):
    version_name: Optional[str] = None
    template: Optional[str] = "modern"

class ExportResumeRequest(BaseModel):
    format: str = "txt"  # "txt" | "docx" | "pdf"
    template: Optional[str] = "modern"

@router.get("")
def get_resume(
    role_id: Optional[str] = None,
    template: Optional[str] = "modern",
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """Fetches or compiles the active ATS resume for the current learner."""
    result = orchestrator.on_resume_requested(
        session,
        current_user.id,
        role_id=role_id,
        template=template,
        force_regenerate=False,
    )
    return result["resume"]

@router.post("/generate")
def generate_resume(
    payload: GenerateResumeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """Regenerates the resume fresh from the student's current profile, skills, and assessments."""
    result = orchestrator.on_resume_requested(
        session,
        current_user.id,
        role_id=payload.role_id,
        template=payload.template,
        force_regenerate=True,
    )
    return result["resume"]

@router.put("")
def update_resume(
    payload: SaveResumeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """Saves user manual edits to the active resume."""
    user = session.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.resume_data
    data["last_modified"] = datetime.utcnow().isoformat()
    user.resume_data = json.dumps(data)
    session.commit()
    return {"status": "saved", "message": "Resume updated successfully."}

@router.get("/ats")
def get_ats_match(
    role_id: Optional[str] = "role_fullstack",
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """Evaluates ATS keyword match against target role specifications."""
    resume_data = orchestrator.on_resume_requested(session, current_user.id, role_id=role_id)["resume"]
    return resume_data["ats_match"]

@router.get("/versions")
def get_resume_versions(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """Lists saved resume versions (max 5) for the user."""
    versions = (
        session.query(ResumeVersion)
        .filter(ResumeVersion.user_id == current_user.id)
        .order_by(ResumeVersion.created_at.desc())
        .limit(5)
        .all()
    )
    return [
        {
            "id": v.id,
            "version_name": v.version_name,
            "role_id": v.role_id,
            "role_name": v.role_name,
            "template": v.template,
            "ats_score": v.ats_score,
            "created_at": v.created_at.strftime("%b %d, %Y %H:%M"),
        }
        for v in versions
    ]

@router.post("/versions")
def save_resume_version(
    payload: CreateVersionRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """Creates a snapshot version of the current resume (keeping max 5)."""
    user = session.query(User).filter(User.id == current_user.id).first()
    if not user or not user.resume_data:
        raise HTTPException(status_code=400, detail="No active resume data to save as a version.")

    data = json.loads(user.resume_data)
    role_id = data.get("target_role_id", "role_fullstack")
    role_name = data.get("target_role_name", "Full Stack Developer")
    ats_score = data.get("ats_match", {}).get("score", 70)
    now_str = datetime.utcnow().strftime("%b %d, %Y")
    version_name = payload.version_name or f"{role_name} ({now_str})"

    # Maintain maximum of 5 versions per user
    existing_count = session.query(ResumeVersion).filter(ResumeVersion.user_id == current_user.id).count()
    if existing_count >= 5:
        oldest = (
            session.query(ResumeVersion)
            .filter(ResumeVersion.user_id == current_user.id)
            .order_by(ResumeVersion.created_at.asc())
            .first()
        )
        if oldest:
            session.delete(oldest)

    version = ResumeVersion(
        user_id=current_user.id,
        role_id=role_id,
        role_name=role_name,
        template=payload.template or data.get("template", "modern"),
        version_name=version_name,
        resume_json=user.resume_data,
        ats_score=ats_score,
        created_at=datetime.utcnow(),
    )
    session.add(version)
    session.commit()

    return {
        "status": "version_saved",
        "version_id": version.id,
        "version_name": version.version_name,
    }

@router.post("/versions/{version_id}/restore")
def restore_resume_version(
    version_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """Restores an earlier saved version into active resume state."""
    version = (
        session.query(ResumeVersion)
        .filter(ResumeVersion.id == version_id, ResumeVersion.user_id == current_user.id)
        .first()
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found.")

    user = session.query(User).filter(User.id == current_user.id).first()
    user.resume_data = version.resume_json
    session.commit()

    return {"status": "restored", "resume_data": json.loads(version.resume_json)}

@router.post("/export")
def export_resume(
    payload: ExportResumeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """Exports the resume to plain text or ATS DOCX format."""
    user = session.query(User).filter(User.id == current_user.id).first()
    if not user or not user.resume_data:
        resume_dict = orchestrator.on_resume_requested(session, current_user.id)["resume"]
    else:
        resume_dict = json.loads(user.resume_data)

    first_name = user.name.split(" ")[0]
    last_name = user.name.split(" ")[-1] if len(user.name.split(" ")) > 1 else "Learner"
    base_filename = f"{first_name}_{last_name}_Resume"

    # Format A: Plain Text
    if payload.format == "txt":
        lines = []
        lines.append(f"{resume_dict['header']['name'].upper()}")
        header_parts = [
            resume_dict['header'].get('email', ''),
            resume_dict['header'].get('phone', ''),
            resume_dict['header'].get('location', ''),
            resume_dict['header'].get('linkedin', ''),
            resume_dict['header'].get('github', ''),
        ]
        lines.append(" | ".join([p for p in header_parts if p]))
        lines.append("\n" + "=" * 50 + "\n")

        # Professional Summary
        lines.append("PROFESSIONAL SUMMARY")
        lines.append(resume_dict.get("summary", ""))
        lines.append("\n" + "-" * 50 + "\n")

        # Technical Competencies
        lines.append("TECHNICAL COMPETENCIES")
        for cat in resume_dict.get("skills", []):
            skill_names = [s["name"] + (" (Verified)" if s.get("verified") else "") for s in cat.get("skills", [])]
            lines.append(f"{cat['category']}: {', '.join(skill_names)}")
        lines.append("\n" + "-" * 50 + "\n")

        # Education
        lines.append("EDUCATION")
        for ed in resume_dict.get("education", []):
            lines.append(f"{ed.get('degree', '')}")
            lines.append(f"{ed.get('institution', '')} | {ed.get('period', '')} | {ed.get('score', '')}")
        lines.append("\n" + "-" * 50 + "\n")

        # Projects
        lines.append("SELECTED PROJECTS")
        for proj in resume_dict.get("projects", []):
            lines.append(f"{proj.get('title', '')} | {proj.get('role', '')} ({proj.get('period', '')})")
            lines.append(f"Technologies: {', '.join(proj.get('skills', []))}")
            lines.append(f"- {proj.get('description', '')}")
            lines.append("")

        # Certifications
        if resume_dict.get("certifications"):
            lines.append("-" * 50 + "\n")
            lines.append("CERTIFICATIONS & ASSESSMENTS")
            for cert in resume_dict.get("certifications", []):
                lines.append(f"- {cert.get('title', '')} ({cert.get('issuer', '')}) - {cert.get('score', '')}")

        content = "\n".join(lines)
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={base_filename}.txt"},
        )

    # Format B: ATS-Compliant DOCX
    elif payload.format == "docx":
        doc = docx.Document()
        for section in doc.sections:
            section.top_margin = Inches(0.7)
            section.bottom_margin = Inches(0.7)
            section.left_margin = Inches(0.7)
            section.right_margin = Inches(0.7)

        # Header: Name
        title_p = doc.add_paragraph()
        title_p.paragraph_format.space_after = Pt(2)
        title_run = title_p.add_run(resume_dict['header']['name'])
        title_run.font.name = "Arial"
        title_run.font.size = Pt(20)
        title_run.bold = True
        title_run.font.color.rgb = RGBColor(11, 59, 46)

        # Header: Contact row
        contact_p = doc.add_paragraph()
        contact_p.paragraph_format.space_after = Pt(12)
        contact_items = [
            resume_dict['header'].get('email', ''),
            resume_dict['header'].get('phone', ''),
            resume_dict['header'].get('location', ''),
            resume_dict['header'].get('linkedin', ''),
            resume_dict['header'].get('github', ''),
        ]
        contact_run = contact_p.add_run(" | ".join([c for c in contact_items if c]))
        contact_run.font.name = "Arial"
        contact_run.font.size = Pt(9.5)
        contact_run.font.color.rgb = RGBColor(75, 94, 85)

        def add_section_heading(title_text):
            h_p = doc.add_paragraph()
            h_p.paragraph_format.space_before = Pt(8)
            h_p.paragraph_format.space_after = Pt(3)
            h_run = h_p.add_run(title_text.upper())
            h_run.font.name = "Arial"
            h_run.font.size = Pt(11)
            h_run.bold = True
            h_run.font.color.rgb = RGBColor(11, 59, 46)

        # Summary
        add_section_heading("Professional Summary")
        sp = doc.add_paragraph()
        sp.paragraph_format.space_after = Pt(8)
        s_run = sp.add_run(resume_dict.get("summary", ""))
        s_run.font.name = "Arial"
        s_run.font.size = Pt(10)

        # Education
        add_section_heading("Education")
        for ed in resume_dict.get("education", []):
            ep = doc.add_paragraph()
            ep.paragraph_format.space_after = Pt(4)
            d_run = ep.add_run(ed.get("degree", ""))
            d_run.bold = True
            d_run.font.size = Pt(10.5)
            ep.add_run(f"\n{ed.get('institution', '')} — {ed.get('period', '')} | {ed.get('score', '')}")

        # Skills
        add_section_heading("Technical Competencies")
        for cat in resume_dict.get("skills", []):
            skp = doc.add_paragraph()
            skp.paragraph_format.space_after = Pt(2)
            c_run = skp.add_run(f"{cat['category']}: ")
            c_run.bold = True
            c_run.font.size = Pt(10)
            names = [s["name"] + (" (Verified)" if s.get("verified") else "") for s in cat.get("skills", [])]
            skp.add_run(", ".join(names))

        # Projects
        add_section_heading("Selected Projects")
        for proj in resume_dict.get("projects", []):
            pp = doc.add_paragraph()
            pp.paragraph_format.space_after = Pt(1)
            pr_title = pp.add_run(f"{proj.get('title', '')} | {proj.get('role', '')} ({proj.get('period', '')})")
            pr_title.bold = True
            pr_title.font.size = Pt(10.5)

            pdesc = doc.add_paragraph()
            pdesc.paragraph_format.space_after = Pt(4)
            pdesc.paragraph_format.left_indent = Inches(0.2)
            pdesc.add_run(f"• Technologies: {', '.join(proj.get('skills', []))}\n• {proj.get('description', '')}")

        # Certifications
        if resume_dict.get("certifications"):
            add_section_heading("Certifications & Verified Assessments")
            for cert in resume_dict.get("certifications", []):
                cp = doc.add_paragraph()
                cp.paragraph_format.space_after = Pt(2)
                cp.add_run(f"• {cert.get('title', '')} ({cert.get('issuer', '')}) — {cert.get('score', '')}")

        bio = io.BytesIO()
        doc.save(bio)
        bio.seek(0)

        return Response(
            content=bio.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={base_filename}.docx"},
        )

    # Format C: PDF
    else:
        return {
            "status": "ready_for_client_print",
            "filename": f"{base_filename}.pdf",
            "resume_data": resume_dict,
        }
