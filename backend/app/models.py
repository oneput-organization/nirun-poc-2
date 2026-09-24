from typing import Literal
from pydantic import BaseModel, Field

class SessionInput(BaseModel):
    role: Literal["admin", "member"]

class ProjectInput(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    framework: str = Field(default="Annual report", max_length=100)
    description: str = Field(default="", max_length=5000)

class PointInput(BaseModel):
    action: Literal["accept", "reject", "reask", "override", "drop", "estimate", "replace", "submit"]
    reason: str = Field(default="", max_length=5000)
    value: str = Field(default="", max_length=10000)

class MemberInput(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    email: str = Field(default="", max_length=254)
    role: str = Field(default="Contributor", max_length=160)
    channel: Literal["Email", "Line", "Teams", "Slack", "WhatsApp", "SMS"] = "Email"

class MessageInput(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    thread: str = Field(default="assistant", max_length=80)
    point: str = Field(default="", max_length=30)

class ActionInput(BaseModel):
    action: str = Field(min_length=1, max_length=160)
    target: str = Field(default="", max_length=160)
    details: dict = Field(default_factory=dict)

class ExportInput(BaseModel):
    format: Literal["Excel", "CSV", "HTML dashboard", "Slides", "Report", "PDF"]

class NewPointInput(BaseModel):
    code: str = Field(pattern=r"^[A-Z]{2,8}-[0-9]{2,4}$")
    name: str = Field(min_length=1, max_length=160)
    owner: str = Field(min_length=1, max_length=160)
    due: str = Field(min_length=1, max_length=30)
    section: str = Field(default="Operations", min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)

class NewSectionInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class IntakeQuestionInput(BaseModel):
    id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,64}$")
    label: str = Field(min_length=1, max_length=240)
    help: str = Field(default="", max_length=600)
    required: bool = False

class IntakeQuestionsInput(BaseModel):
    questions: list[IntakeQuestionInput] = Field(min_length=1, max_length=12)
