from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, UploadFile, File
from fastapi.responses import PlainTextResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import csv
import io
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import secrets
from datetime import datetime, timedelta
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
JWT_ALGO = 'HS256'

app = FastAPI()
api_router = APIRouter(prefix="/api")
HOMEWORK_UPLOAD_DIR = ROOT_DIR / 'uploads' / 'homework'
LEAVE_UPLOAD_DIR = ROOT_DIR / 'uploads' / 'leaves'
HOMEWORK_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
LEAVE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=ROOT_DIR / 'uploads'), name='uploads')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------- Role config ----------------
ROLE_CONFIG = {
    'admin': {
        'name': 'Admin',
        'menu': None,  # None = all
    },
    'principal': {
        'name': 'Principal',
        'menu': ['dashboard', 'management', 'student', 'academics', 'attendance', 'teachers', 'staff',
                 'exams', 'marks', 'homework', 'leave', 'timetable', 'notifications',
                 'transport', 'communications', 'visitor', 'question', 'collections', 'ai', 'settings'],
    },
    'director': {
        'name': 'Director',
        'menu': ['dashboard', 'management', 'student', 'academics', 'attendance', 'teachers', 'staff',
                 'exams', 'marks', 'homework', 'leave', 'timetable', 'notifications',
                 'transport', 'communications', 'visitor', 'question', 'collections', 'ai', 'settings'],
    },
    'academic_coordinator': {
        'name': 'Academic Coordinator',
        'menu': ['dashboard', 'academics', 'teachers', 'notifications'],
    },
    'fee_manager': {
        'name': 'Fee Manager',
        'menu': ['dashboard', 'student', 'fee', 'expenses', 'notifications',
                 'communications', 'ai', 'settings'],
    },
}

# ---------------- Models ----------------
class LoginReq(BaseModel):
    role: str

class Student(BaseModel):
    id: str = Field(default_factory=lambda: f"EP-{uuid.uuid4().hex[:8].upper()}")
    name: str
    admission_no: str = ""
    class_name: str = ""
    section: str = ""
    roll: str = ""
    academic_year: str = "2024-2025"
    status: str = "Active"
    blood_group: str = ""
    dob: str = ""
    gender: str = ""
    aadhar: str = ""
    father_name: str = ""
    mother_name: str = ""
    mobile: str = ""
    mobile_alt: str = ""
    emergency_contact: str = ""
    guardian_name: str = ""
    caste: str = ""
    subcaste: str = ""
    phone: str = ""
    parent_id: str = ""
    guardian: str = ""
    address: str = ""
    password: str = ""
    parent_name: str = ""
    parent_phone: str = ""
    balance: float = 0.0
    avatar: str = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"

class Exam(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    class_name: str = "Grade 10"
    section: str = "Section A"
    subject: str = "Mathematics"
    subjects: List[str] = []
    date: str = ""
    room: str = ""
    start_time: str = ""
    end_time: str = ""
    max_marks: int = 100
    passing_marks: int = 40
    grade_scheme: List[dict] = []
    status: str = "Draft"

class Leave(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    leave_type: str
    from_date: str
    to_date: str
    person_type: str = "Staff"
    person_id: str = ""
    class_name: str = ""
    section: str = ""
    days: int = 1
    reason: str = ""
    status: str = "Pending"
    attachment_name: str = ""
    attachment_url: str = ""
    attachment_type: str = ""
    submitted_at: str = ""
    reviewed_by: str = ""
    reviewed_at: str = ""
    avatar: str = "https://i.pravatar.cc/80?img=12"

class PayReq(BaseModel):
    method: str = "Cash"
    amount: Optional[float] = None
    discount: float = 0
    discount_reason: str = ""

class TeacherAllocation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    teacher_id: str
    teacher_name: str
    subject: str
    class_name: str
    section: str = ""
    academic_year: str = "2026-2027"

class TimetablePeriod(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    class_name: str
    section: str
    day: str
    start_time: str
    end_time: str
    subject: str
    teacher_id: str = ""
    teacher_name: str = ""
    room: str = ""
    academic_year: str = ""

class InventoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_name: str
    category: str = "Stationery"
    sku: str = ""
    unit: str = "Units"
    quantity: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=0, ge=0)
    unit_price: float = Field(default=0, ge=0)
    parent_price: float = Field(default=0, ge=0)
    supplier: str = ""
    location: str = "Central Store"
    notes: str = ""
    status: str = "Active"

class ExpenseEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    expense_date: str
    category: str
    paid_to: str
    description: str
    amount: float = Field(gt=0)
    payment_method: str = "Cash"
    reference: str = ""
    notes: str = ""

class ClassroomObservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    teacher_id: str
    teacher_name: str
    class_name: str
    section: str = ""
    subject: str
    unit_name: str = ""
    observation_date: str = ""
    plan_score: int = Field(ge=0, le=5)
    behaviour_score: int = Field(ge=0, le=5)
    engagement_score: int = Field(ge=0, le=5)
    notes: str = ""
    academic_year: str = "2026-2027"

# ---------------- Auth helpers ----------------
def create_token(role: str):
    payload = {'role': role, 'exp': datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    role = payload.get('role')
    if role not in ROLE_CONFIG:
        raise HTTPException(status_code=401, detail="Invalid role")
    return role

def clean(doc):
    if doc and '_id' in doc:
        doc.pop('_id', None)
    return doc

async def add_event(etype: str, title: str, body: str):
    await db.events.insert_one({
        'id': str(uuid.uuid4()), 'type': etype, 'title': title, 'body': body,
        'unread': True, 'created': datetime.utcnow().isoformat(),
    })

# ---------------- Auth routes ----------------
@api_router.post("/auth/login")
async def login(req: LoginReq):
    role = req.role
    if role not in ROLE_CONFIG:
        raise HTTPException(status_code=400, detail="Unknown role")
    cfg = ROLE_CONFIG[role]
    return {
        'token': create_token(role),
        'role': role,
        'name': cfg['name'],
        'menu': cfg['menu'],
    }

@api_router.get("/auth/me")
async def me(role: str = Depends(get_current)):
    cfg = ROLE_CONFIG[role]
    return {'role': role, 'name': cfg['name'], 'menu': cfg['menu']}

# ---------------- Students ----------------
@api_router.get("/students")
async def list_students(role: str = Depends(get_current)):
    docs = await db.students.find().to_list(1000)
    return [clean(d) for d in docs]

@api_router.get("/students/{sid}")
async def get_student(sid: str, role: str = Depends(get_current)):
    doc = await db.students.find_one({'id': sid})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return clean(doc)

REQUIRED_STUDENT_FIELDS = {
    'name': 'Student Name', 'admission_no': 'Admission Number', 'class_name': 'Class',
    'section': 'Section', 'academic_year': 'Academic Year', 'gender': 'Gender',
    'father_name': 'Father/Guardian Name', 'mobile': 'Mobile Number',
}

async def sync_student_fee_balance(student_id: str):
    """Keep the student-level balance equal to every unpaid fee head, not one invoice."""
    invoices = await db.fees.find({'student_id': student_id}).to_list(5000)
    balance = round(sum(float(item.get('due') or 0) for item in invoices), 2)
    await db.students.update_one({'id': student_id}, {'$set': {'balance': balance}})
    return balance

async def apply_active_fee_structures(student: dict):
    """Apply matching, current-year fee structures when a student is admitted."""
    class_name = str(student.get('class_name') or '').strip()
    section = str(student.get('section') or '').strip()
    academic_year = str(student.get('academic_year') or '').strip()
    if not class_name or not section:
        return 0

    created = 0
    structures = await db.fee_structures.find().to_list(1000)
    for structure in structures:
        if structure.get('active') is False:
            continue
        structure_year = str(structure.get('academic_year') or '').strip()
        if structure_year and academic_year and structure_year != academic_year:
            continue
        targets = structure.get('targets') or []
        applies_to_student = any(
            str(target.get('class_name') or '').strip() == class_name
            and str(target.get('section') or '').strip() == section
            for target in targets
        )
        if not applies_to_student:
            continue
        if await db.fees.find_one({'student_id': student['id'], 'structure_id': structure.get('id')}):
            continue
        amount = float(structure.get('amount') or 0)
        if amount <= 0:
            continue
        await db.fees.insert_one({
            'id': f"FEE-{uuid.uuid4().hex[:8].upper()}", 'structure_id': structure.get('id'),
            'student_id': student['id'], 'name': student.get('name', ''), 'avatar': student.get('avatar', ''),
            'fee_name': structure.get('name', 'School Fee'), 'category': structure.get('category', ''),
            'description': structure.get('description', ''), 'academic_year': academic_year or structure_year,
            'due_date': structure.get('due_date', ''), 'total': amount, 'paid': 0, 'discount': 0,
            'due': amount, 'status': 'Unpaid', 'created': datetime.utcnow().isoformat(),
        })
        created += 1
    await sync_student_fee_balance(student['id'])
    return created

@api_router.post("/students")
async def create_student(s: Student, role: str = Depends(get_current)):
    doc = s.dict()
    missing = [label for k, label in REQUIRED_STUDENT_FIELDS.items() if not str(doc.get(k) or '').strip()]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing required field(s): {', '.join(missing)}")
    adm = str(doc.get('admission_no') or '').strip()
    if await db.students.find_one({'admission_no': adm}):
        raise HTTPException(status_code=409, detail=f"A student with admission number '{adm}' already exists.")
    structure = await db.academic_structure.find_one({'id': 'school-structure'})
    if structure and structure.get('classes'):
        allowed = {(item.get('name'), section.get('name')) for item in structure.get('classes', []) for section in item.get('sections', [])}
        if (doc['class_name'], doc['section']) not in allowed:
            raise HTTPException(status_code=422, detail='Choose a class and section created in Academic Setup.')
        doc['academic_year'] = structure.get('academic_year') or doc['academic_year']
    await db.students.insert_one(dict(doc))
    fees_added = await apply_active_fee_structures(doc)
    await add_event('success', 'New admission approved', f"{doc['name']} has been enrolled in {doc.get('class_name','')} {doc.get('section','')}.".strip())
    return {**doc, 'fees_assigned': fees_added}

@api_router.put("/students/{sid}")
async def update_student(sid: str, s: Student, role: str = Depends(get_current)):
    doc = s.dict()
    doc['id'] = sid
    await db.students.update_one({'id': sid}, {'$set': doc}, upsert=True)
    return doc

@api_router.delete("/students/{sid}")
async def delete_student(sid: str, role: str = Depends(get_current)):
    await db.students.delete_one({'id': sid})
    await db.fees.delete_many({'student_id': sid})
    return {'ok': True}

# ---------------- Attendance ----------------
ATTENDANCE_ROLES = {'student': 'students', 'teacher': 'teachers', 'staff': 'staff'}

@api_router.get("/staff")
async def list_staff(role: str = Depends(get_current)):
    return [clean(doc) for doc in await db.staff.find().sort('name', 1).to_list(1000)]

def staff_record(payload: dict, staff_id: str = ''):
    name = str(payload.get('name') or '').strip()
    if not name:
        raise HTTPException(status_code=422, detail='Staff member name is required.')
    employee_id = str(staff_id or payload.get('employee_id') or payload.get('id') or '').strip() or f"STF-{uuid.uuid4().hex[:8].upper()}"
    return {
        'id': employee_id, 'name': name, 'access_role': str(payload.get('access_role') or '').strip(),
        'working_hours': str(payload.get('working_hours') or 'Full-time').strip(),
        'phone': str(payload.get('phone') or '').strip(), 'email': str(payload.get('email') or '').strip(),
        'joining_date': str(payload.get('joining_date') or '').strip(),
        'designation': str(payload.get('designation') or '').strip(),
        'department': str(payload.get('department') or '').strip(),
        'status': str(payload.get('status') or 'Active').strip() or 'Active',
        'avatar': str(payload.get('avatar') or 'https://i.pravatar.cc/80?img=49').strip(),
        'created': payload.get('created') or datetime.utcnow().isoformat(),
    }

@api_router.post("/staff")
async def create_staff(payload: dict, role: str = Depends(get_current)):
    doc = staff_record(payload)
    if await db.staff.find_one({'id': doc['id']}):
        raise HTTPException(status_code=409, detail='That employee ID already exists.')
    if doc['email'] and await db.staff.find_one({'email': doc['email']}):
        raise HTTPException(status_code=409, detail='That email is already used by another staff member.')
    await db.staff.insert_one(dict(doc))
    await add_event('success', 'Staff member added', f"{doc['name']} was added to the staff directory.")
    return doc

@api_router.put("/staff/{staff_id}")
async def update_staff(staff_id: str, payload: dict, role: str = Depends(get_current)):
    old = await db.staff.find_one({'id': staff_id})
    if not old:
        raise HTTPException(status_code=404, detail='Staff member not found.')
    doc = staff_record({**old, **payload}, staff_id=staff_id)
    if doc['email']:
        duplicate = await db.staff.find_one({'email': doc['email'], 'id': {'$ne': staff_id}})
        if duplicate:
            raise HTTPException(status_code=409, detail='That email is already used by another staff member.')
    await db.staff.update_one({'id': staff_id}, {'$set': doc})
    return doc

@api_router.get("/attendance/roster")
async def attendance_roster(attendance_role: str, attendance_date: str, class_name: str = '', section: str = '', role: str = Depends(get_current)):
    collection = ATTENDANCE_ROLES.get(attendance_role)
    if not collection:
        raise HTTPException(status_code=422, detail='Choose Student, Teacher or Staff.')
    query = {}
    if attendance_role == 'student':
        if not class_name or not section:
            return []
        query = {'class_name': class_name, 'section': section}
    people = [clean(doc) for doc in await db[collection].find(query).sort('name', 1).to_list(1000)]
    ids = [person.get('id') for person in people if person.get('id')]
    saved = {doc['entity_id']: clean(doc) for doc in await db.attendance_records.find({'attendance_role': attendance_role, 'attendance_date': attendance_date, 'entity_id': {'$in': ids}}).to_list(1000)} if ids else {}
    return [{'id': person.get('id'), 'name': person.get('name', ''), 'roll': person.get('roll', ''), 'class_name': person.get('class_name', class_name), 'section': person.get('section', section), 'status': saved.get(person.get('id'), {}).get('status', '')} for person in people]

@api_router.post("/attendance/mark")
async def mark_attendance(payload: dict, role: str = Depends(get_current)):
    attendance_role = payload.get('attendance_role')
    attendance_date = str(payload.get('attendance_date') or '').strip()
    class_name, section = str(payload.get('class_name') or '').strip(), str(payload.get('section') or '').strip()
    collection = ATTENDANCE_ROLES.get(attendance_role)
    entries = payload.get('entries') or []
    if not collection or not attendance_date or not entries:
        raise HTTPException(status_code=422, detail='Choose role, date and at least one attendance entry.')
    if attendance_role == 'student' and (not class_name or not section):
        raise HTTPException(status_code=422, detail='Choose both Class and Section for student attendance.')
    submitted_group = {'attendance_role': attendance_role, 'attendance_date': attendance_date}
    if attendance_role == 'student':
        submitted_group.update({'class_name': class_name, 'section': section})
    if await db.attendance_records.find_one(submitted_group):
        group_name = f"{class_name} {section}".strip() if attendance_role == 'student' else attendance_role.title() + 's'
        raise HTTPException(status_code=409, detail=f"Attendance for {group_name} has already been submitted for {attendance_date}. Use View Attendance or Attendance Reports to review it.")
    valid_statuses = {'Present', 'Absent', 'Late', 'Leave'}
    saved = 0
    parent_notifications = 0
    for entry in entries:
        entity_id = str(entry.get('entity_id') or '').strip()
        status = str(entry.get('status') or '').strip()
        if not entity_id or status not in valid_statuses:
            continue
        person = await db[collection].find_one({'id': entity_id})
        if not person:
            continue
        if attendance_role == 'student' and (person.get('class_name') != class_name or person.get('section') != section):
            continue
        record = {'id': f"ATT-{uuid.uuid4().hex[:10].upper()}", 'attendance_role': attendance_role, 'attendance_date': attendance_date,
                  'entity_id': entity_id, 'entity_name': person.get('name', ''), 'class_name': person.get('class_name', class_name) if attendance_role == 'student' else '',
                  'section': person.get('section', section) if attendance_role == 'student' else '', 'status': status,
                  'updated_by': ROLE_CONFIG[role]['name'], 'updated': datetime.utcnow().isoformat()}
        await db.attendance_records.update_one({'attendance_role': attendance_role, 'attendance_date': attendance_date, 'entity_id': entity_id}, {'$set': record}, upsert=True)
        if attendance_role == 'student' and status == 'Absent':
            parent_name = person.get('parent_name') or person.get('father_name') or person.get('guardian_name') or 'Parent'
            parent_phone = person.get('parent_phone') or person.get('mobile_alt') or person.get('phone') or person.get('mobile') or ''
            message = f"Dear {parent_name}, your child {person.get('name', '')} from {class_name}, Section {section} is absent from school today ({attendance_date}). Please contact the school if this is incorrect."
            await db.parent_notifications.insert_one({
                'id': f"PAR-ATT-{uuid.uuid4().hex[:10].upper()}", 'student_id': entity_id,
                'student_name': person.get('name', ''), 'parent_name': parent_name, 'parent_phone': parent_phone,
                'channel': 'SMS / WhatsApp', 'message': message, 'status': 'Queued',
                'attendance_date': attendance_date, 'class_name': class_name, 'section': section,
                'created': datetime.utcnow().isoformat(),
            })
            parent_notifications += 1
        saved += 1
    if not saved:
        raise HTTPException(status_code=422, detail='No valid attendance entries were found for the selected role and group.')
    await add_event('success', 'Attendance saved', f"{saved} {attendance_role} attendance record(s) saved for {attendance_date}.")
    if parent_notifications:
        await add_event('info', 'Parent absence messages queued', f"{parent_notifications} parent message(s) were queued for absent students in {class_name} {section}.")
    return {'saved': saved, 'parent_notifications': parent_notifications, 'attendance_date': attendance_date}

@api_router.get("/attendance/records")
async def attendance_records(attendance_role: str = '', date_from: str = '', date_to: str = '', class_name: str = '', section: str = '', role: str = Depends(get_current)):
    query = {}
    if attendance_role:
        query['attendance_role'] = attendance_role
    if class_name:
        query['class_name'] = class_name
    if section:
        query['section'] = section
    if date_from or date_to:
        query['attendance_date'] = {}
        if date_from: query['attendance_date']['$gte'] = date_from
        if date_to: query['attendance_date']['$lte'] = date_to
    return [clean(doc) for doc in await db.attendance_records.find(query).sort([('attendance_date', -1), ('entity_name', 1)]).to_list(5000)]

# ---------------- Homework ----------------
@api_router.post('/homework/attachment')
async def upload_homework_attachment(file: UploadFile = File(...), role: str = Depends(get_current)):
    if not file.filename:
        raise HTTPException(status_code=422, detail='Choose a file to attach.')
    content = await file.read()
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=422, detail='Each homework attachment must be smaller than 15 MB.')
    safe_name = Path(file.filename).name
    stored_name = f"{uuid.uuid4().hex}_{safe_name}"
    (HOMEWORK_UPLOAD_DIR / stored_name).write_bytes(content)
    return {
        'name': safe_name, 'size': len(content), 'content_type': file.content_type or 'application/octet-stream',
        'url': f'http://localhost:8001/uploads/homework/{stored_name}',
    }

@api_router.post('/leaves/attachment')
async def upload_leave_attachment(file: UploadFile = File(...), role: str = Depends(get_current)):
    if not file.filename:
        raise HTTPException(status_code=422, detail='Choose a file to attach.')
    allowed_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'}
    allowed_mime_prefixes = ('image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/')
    lower_name = Path(file.filename).name.lower()
    ext = Path(lower_name).suffix.lower()
    mime = (file.content_type or '').lower()
    if ext not in allowed_extensions and not any(mime.startswith(prefix) for prefix in allowed_mime_prefixes):
        raise HTTPException(status_code=422, detail='Attachments must be an image, PDF, or document file.')
    content = await file.read()
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=422, detail='Each leave attachment must be smaller than 15 MB.')
    safe_name = Path(file.filename).name
    stored_name = f"{uuid.uuid4().hex}_{safe_name}"
    (LEAVE_UPLOAD_DIR / stored_name).write_bytes(content)
    return {
        'name': safe_name,
        'size': len(content),
        'content_type': mime or 'application/octet-stream',
        'url': f'http://localhost:8001/uploads/leaves/{stored_name}',
    }

@api_router.get('/homework')
async def get_homework(class_name: str = '', section: str = '', role: str = Depends(get_current)):
    query = {}
    if class_name: query['class_name'] = class_name
    if section: query['section'] = section
    return [clean(item) for item in await db.homework.find(query).sort('created', -1).to_list(5000)]

@api_router.post('/homework')
async def create_homework(payload: dict, role: str = Depends(get_current)):
    class_name = str(payload.get('class_name') or '').strip()
    section = str(payload.get('section') or '').strip()
    instructions = str(payload.get('instructions') or '').strip()
    subject = str(payload.get('subject') or '').strip()
    due_date = str(payload.get('due_date') or '').strip()
    if not class_name or not section or not instructions or not due_date:
        raise HTTPException(status_code=422, detail='Choose Class and Section, enter homework instructions, and set a due date.')
    structure = await db.academic_structure.find_one({'id': 'school-structure'}) or {}
    school_class = next((item for item in structure.get('classes', []) if item.get('name') == class_name), None)
    if not school_class or not any(item.get('name') == section for item in school_class.get('sections', [])):
        raise HTTPException(status_code=422, detail='Choose a Class and Section from Academic Setup.')
    now = datetime.utcnow().isoformat()
    homework = {
        'id': f'HW-{uuid.uuid4().hex[:10].upper()}', 'class_name': class_name, 'section': section,
        'subject': subject or 'General', 'instructions': instructions, 'due_date': due_date,
        'attachments': payload.get('attachments') or [], 'send_parent_app': bool(payload.get('send_parent_app', True)),
        'send_whatsapp': bool(payload.get('send_whatsapp', True)), 'assigned_by': ROLE_CONFIG[role]['name'],
        'created': now, 'status': 'Active',
    }
    await db.homework.insert_one(homework)
    recipients = [clean(item) for item in await db.students.find({'class_name': class_name, 'section': section, 'status': {'$ne': 'Inactive'}}).to_list(5000)]
    channels = []
    if homework['send_parent_app']: channels.append('Parent App')
    if homework['send_whatsapp']: channels.append('WhatsApp')
    queued = 0
    for recipient in recipients:
        for channel in channels:
            await db.parent_notifications.insert_one({
                'id': f'PAR-HW-{uuid.uuid4().hex[:10].upper()}', 'student_id': recipient.get('id'),
                'student_name': recipient.get('name', ''), 'parent_name': recipient.get('parent_name') or recipient.get('father_name') or 'Parent',
                'parent_phone': recipient.get('parent_phone') or recipient.get('phone') or recipient.get('mobile') or '',
                'channel': channel, 'status': 'Queued', 'homework_id': homework['id'],
                'message': f"Homework for {class_name}, Section {section}: {instructions}", 'created': now,
            })
            queued += 1
    await add_event('success', 'Homework assigned', f"{class_name} {section} homework was assigned by {ROLE_CONFIG[role]['name']} and {queued} parent notification(s) were queued.")
    output = clean(homework)
    output['notifications_queued'] = queued
    output['students'] = len(recipients)
    return output

# ---------------- Fees ----------------
def fee_status(doc: dict):
    due, total = float(doc.get('due') or 0), float(doc.get('total') or 0)
    if due <= 0:
        return 'Paid'
    if float(doc.get('paid') or 0) > 0:
        return 'Partial'
    if doc.get('due_date') and doc.get('due_date') < datetime.utcnow().strftime('%Y-%m-%d'):
        return 'Overdue'
    return doc.get('status') if doc.get('status') in {'Overdue', 'Unpaid'} else 'Unpaid'

async def fee_with_student(doc: dict):
    item = clean(doc)
    student = await db.students.find_one({'id': item.get('student_id')}) if item.get('student_id') else None
    if student:
        item['name'] = student.get('name') or item.get('name', '')
        item['class_name'] = student.get('class_name', '')
        item['section'] = student.get('section', '')
        item['roll'] = student.get('roll', '')
        item['admission_no'] = student.get('admission_no', '')
        item['parent_name'] = student.get('parent_name') or student.get('father_name', '')
        item['parent_phone'] = student.get('parent_phone') or student.get('mobile') or student.get('phone', '')
        item['avatar'] = student.get('avatar', item.get('avatar', ''))
    item['status'] = fee_status(item)
    return item

@api_router.get("/fees")
async def list_fees(role: str = Depends(get_current)):
    docs = await db.fees.find().to_list(5000)
    return [await fee_with_student(d) for d in docs]

@api_router.get("/fees/summary")
async def fees_summary(role: str = Depends(get_current)):
    docs = await db.fees.find().to_list(1000)
    total = sum(d.get('total', 0) for d in docs)
    paid = sum(d.get('paid', 0) for d in docs)
    due = sum(d.get('due', 0) for d in docs)
    return {
        'collected': paid, 'pending': due, 'total': total,
        'invoices': len(docs),
    }

@api_router.get("/fees/structures")
async def fee_structures(role: str = Depends(get_current)):
    return [clean(x) for x in await db.fee_structures.find().sort('created', -1).to_list(500)]

@api_router.get("/fees/edit-requests")
async def fee_edit_requests(role: str = Depends(get_current)):
    rows = [clean(x) for x in await db.fee_edit_requests.find({'status': 'Pending'}).sort('requested_at', -1).to_list(100)]
    if role not in {'principal', 'director'}:
        for row in rows:
            row.pop('otp', None)
    return rows

@api_router.post("/fees/structures")
async def create_fee_structure(payload: dict, role: str = Depends(get_current)):
    name = str(payload.get('name') or '').strip()
    category = str(payload.get('category') or '').strip()
    amount = float(payload.get('amount') or 0)
    targets = payload.get('targets') or []
    if not name or not category or amount <= 0 or not targets:
        raise HTTPException(status_code=422, detail='Enter a fee name, category, positive amount and at least one class-section.')
    structure = await db.academic_structure.find_one({'id': 'school-structure'}) or {}
    academic_year = str(payload.get('academic_year') or structure.get('academic_year') or '').strip()
    fee_structure = {
        'id': f"FSTR-{uuid.uuid4().hex[:8].upper()}", 'name': name, 'category': category,
        'amount': amount, 'description': str(payload.get('description') or '').strip(),
        'academic_year': academic_year, 'start_date': str(payload.get('start_date') or '').strip(),
        'due_date': str(payload.get('due_date') or '').strip(), 'targets': targets,
        'created': datetime.utcnow().isoformat(), 'created_by': ROLE_CONFIG[role]['name'],
    }
    await db.fee_structures.insert_one(dict(fee_structure))
    clauses = [{'class_name': str(x.get('class_name') or ''), 'section': str(x.get('section') or '')} for x in targets if x.get('class_name') and x.get('section')]
    students = await db.students.find({'$or': clauses}).to_list(5000) if clauses else []
    created = 0
    for student in students:
        invoice = {
            'id': f"FEE-{uuid.uuid4().hex[:8].upper()}", 'structure_id': fee_structure['id'],
            'student_id': student.get('id'), 'name': student.get('name', ''), 'avatar': student.get('avatar', ''),
            'fee_name': name, 'category': category, 'description': fee_structure['description'],
            'academic_year': academic_year, 'due_date': fee_structure['due_date'],
            'total': amount, 'paid': 0, 'due': amount, 'status': 'Unpaid', 'created': datetime.utcnow().isoformat(),
        }
        await db.fees.insert_one(invoice)
        created += 1
    for student in students:
        await sync_student_fee_balance(student.get('id', ''))
    await add_event('success', 'Fee structure created', f"{name} was assigned to {created} student(s).")
    return {**fee_structure, 'invoices_created': created}

@api_router.post("/fees/structures/{structure_id}/edit-request")
async def request_fee_structure_edit(structure_id: str, payload: dict, role: str = Depends(get_current)):
    fee_structure = await db.fee_structures.find_one({'id': structure_id})
    if not fee_structure:
        raise HTTPException(status_code=404, detail='Fee structure not found.')
    if await db.fee_edit_requests.find_one({'structure_id': structure_id, 'status': 'Pending'}):
        raise HTTPException(status_code=409, detail='An approval request is already waiting for the Director.')
    editable = {key: payload.get(key) for key in ['name', 'category', 'amount', 'description', 'start_date', 'due_date'] if key in payload}
    if not editable:
        raise HTTPException(status_code=422, detail='Enter at least one fee detail to change.')
    if 'amount' in editable:
        try:
            editable['amount'] = float(editable['amount'])
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail='Amount must be a valid number.')
        if editable['amount'] <= 0:
            raise HTTPException(status_code=422, detail='Amount must be greater than zero.')
    request = {'id': f"FEE-EDIT-{uuid.uuid4().hex[:10].upper()}", 'structure_id': structure_id,
               'fee_name': fee_structure.get('name', ''), 'changes': editable, 'status': 'Pending',
               'otp': f"{secrets.randbelow(1000000):06d}", 'requested_by': ROLE_CONFIG[role]['name'],
               'requested_at': datetime.utcnow().isoformat()}
    await db.fee_edit_requests.insert_one(request)
    await add_event('info', 'Fee edit approval required', f"Director OTP approval is required to change {fee_structure.get('name', 'a fee structure')}.")
    return {'id': request['id'], 'status': 'Pending', 'message': 'Request sent to the Director. Ask the Director for the approval OTP.'}

@api_router.post("/fees/edit-requests/{request_id}/confirm")
async def confirm_fee_structure_edit(request_id: str, payload: dict, role: str = Depends(get_current)):
    request = await db.fee_edit_requests.find_one({'id': request_id, 'status': 'Pending'})
    if not request:
        raise HTTPException(status_code=404, detail='This edit request is no longer available.')
    if str(payload.get('otp') or '').strip() != request.get('otp'):
        raise HTTPException(status_code=422, detail='The Director approval OTP is incorrect.')
    changes = request.get('changes') or {}
    await db.fee_structures.update_one({'id': request['structure_id']}, {'$set': {**changes, 'updated': datetime.utcnow().isoformat(), 'updated_by': ROLE_CONFIG[role]['name']}})
    # Update unpaid invoice balances without changing money already collected or discounts already given.
    if 'amount' in changes or 'name' in changes or 'category' in changes or 'description' in changes or 'due_date' in changes:
        invoices = await db.fees.find({'structure_id': request['structure_id']}).to_list(5000)
        for invoice in invoices:
            update = {key: changes[key] for key in ['name', 'category', 'description', 'due_date'] if key in changes}
            if 'name' in update:
                update['fee_name'] = update.pop('name')
            if 'amount' in changes:
                paid = float(invoice.get('paid') or 0); discount = float(invoice.get('discount') or 0)
                update['total'] = changes['amount']; update['due'] = max(0, changes['amount'] - paid - discount)
                update['status'] = 'Paid' if update['due'] <= 0 else ('Partial' if paid or discount else 'Unpaid')
            await db.fees.update_one({'id': invoice['id']}, {'$set': update})
    await db.fee_edit_requests.update_one({'id': request_id}, {'$set': {'status': 'Approved', 'confirmed_at': datetime.utcnow().isoformat(), 'confirmed_by': ROLE_CONFIG[role]['name']}})
    await add_event('success', 'Fee structure updated', f"Director-approved changes were applied to {request.get('fee_name', 'the fee structure')}.")
    return {'ok': True}

@api_router.get("/fees/collections")
async def fee_collections(class_name: str = '', section: str = '', role: str = Depends(get_current)):
    invoices = [await fee_with_student(x) for x in await db.fees.find().to_list(5000)]
    groups = {}
    for fee in invoices:
        if class_name and fee.get('class_name') != class_name: continue
        if section and fee.get('section') != section: continue
        sid = fee.get('student_id') or fee.get('name') or fee.get('id')
        row = groups.setdefault(sid, {'student_id': fee.get('student_id', ''), 'name': fee.get('name', ''), 'avatar': fee.get('avatar', ''), 'class_name': fee.get('class_name', ''), 'section': fee.get('section', ''), 'admission_no': fee.get('admission_no', ''), 'total': 0, 'paid': 0, 'due': 0, 'invoices': []})
        row['total'] += float(fee.get('total') or 0); row['paid'] += float(fee.get('paid') or 0); row['due'] += float(fee.get('due') or 0); row['invoices'].append(fee)
    result = []
    for row in groups.values():
        row['status'] = 'Paid' if row['due'] <= 0 else ('Partial' if row['paid'] > 0 else 'Unpaid')
        result.append(row)
    return sorted(result, key=lambda x: x['name'].lower())

@api_router.get("/fees/receipts")
async def fee_receipts(role: str = Depends(get_current)):
    return [clean(x) for x in await db.fee_receipts.find().sort('paid_at', -1).to_list(5000)]

@api_router.post("/fees/{fid}/pay")
async def pay_fee(fid: str, req: PayReq, role: str = Depends(get_current)):
    doc = await db.fees.find_one({'id': fid})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    current_due = doc.get('due', 0)
    amt = req.amount if req.amount is not None else current_due
    discount = max(0, float(req.discount or 0))
    amt = max(0, min(float(amt), current_due))
    discount = min(discount, max(0, current_due - amt))
    if amt + discount <= 0:
        raise HTTPException(status_code=422, detail='Enter a payment amount or an approved discount.')
    doc['paid'] = float(doc.get('paid', 0)) + amt
    doc['discount'] = float(doc.get('discount', 0)) + discount
    doc['due'] = current_due - amt - discount
    doc['status'] = 'Paid' if doc['due'] <= 0 else 'Partial'
    doc['method'] = req.method
    await db.fees.update_one({'id': fid}, {'$set': doc})
    # Keep the student balance equal to all of their unpaid fee heads.
    if doc.get('student_id'):
        await sync_student_fee_balance(doc['student_id'])
    student = await db.students.find_one({'id': doc.get('student_id')}) if doc.get('student_id') else None
    receipt = {'id': f"RCP-{uuid.uuid4().hex[:10].upper()}", 'fee_id': fid, 'student_id': doc.get('student_id', ''),
               'student_name': doc.get('name', ''), 'fee_name': doc.get('fee_name', 'School Fee'), 'amount': amt,
               'discount': discount, 'discount_reason': req.discount_reason, 'method': req.method, 'balance_after': doc['due'],
               'academic_year': doc.get('academic_year', ''), 'admission_no': (student or {}).get('admission_no', ''),
               'class_name': (student or {}).get('class_name', ''), 'section': (student or {}).get('section', ''),
               'parent_name': (student or {}).get('parent_name') or (student or {}).get('father_name') or '',
               'parent_phone': (student or {}).get('parent_phone') or (student or {}).get('mobile') or '',
               'paid_at': datetime.utcnow().isoformat(), 'received_by': ROLE_CONFIG[role]['name']}
    await db.fee_receipts.insert_one(receipt)
    if student:
        await db.parent_notifications.insert_one({'id': f"PAR-FEE-{uuid.uuid4().hex[:10].upper()}", 'student_id': doc.get('student_id'),
            'student_name': doc.get('name', ''), 'parent_name': receipt['parent_name'], 'parent_phone': receipt['parent_phone'],
            'channel': 'SMS / WhatsApp / App Push', 'status': 'Queued',
            'message': f"Fee receipt {receipt['id']}: ₹{amt:,.2f} received for {doc.get('fee_name', 'School Fee')}. Remaining balance: ₹{doc['due']:,.2f}.",
            'created': datetime.utcnow().isoformat()})
    await add_event('success', 'Fee collected', f"\u20b9{amt:,.0f} collected from {doc.get('name','student')} via {req.method}.")
    return {**clean(doc), 'receipt': clean(receipt)}

# ---------------- Exams ----------------
@api_router.get("/exams")
async def list_exams(role: str = Depends(get_current)):
    docs = await db.exams.find().to_list(1000)
    return [clean(d) for d in docs]

@api_router.post("/exams")
async def create_exam(e: Exam, role: str = Depends(get_current)):
    doc = e.dict()
    if doc.get('status') != 'Draft' and not doc.get('status'):
        doc['status'] = 'Scheduled'
    await db.exams.insert_one(dict(doc))
    return doc

@api_router.delete("/exams")
async def clear_exams(role: str = Depends(get_current)):
    if role not in ('admin', 'director', 'principal'):
        raise HTTPException(status_code=403, detail='Only Admin, Principal or Director can clear examination records.')
    result = await db.exams.delete_many({})
    await add_event('info', 'Examination records cleared', f"{result.deleted_count} old examination record(s) were removed before the new academic setup.")
    return {'deleted': result.deleted_count}

@api_router.put("/exams/{eid}")
async def update_exam(eid: str, e: Exam, role: str = Depends(get_current)):
    doc = e.dict(); doc['id'] = eid
    await db.exams.update_one({'id': eid}, {'$set': doc}, upsert=True)
    return doc

# ---------------- Leaves ----------------
@api_router.get("/leaves")
async def list_leaves(role: str = Depends(get_current)):
    docs = await db.leaves.find().sort('created', -1).to_list(1000)
    return [clean(d) for d in docs]

@api_router.get("/leaves/summary")
async def leaves_summary(role: str = Depends(get_current)):
    docs = await db.leaves.find().to_list(1000)
    def cnt(s): return len([d for d in docs if d.get('status') == s])
    return {'total': len(docs), 'approved': cnt('Approved'),
            'rejected': cnt('Rejected'), 'pending': cnt('Pending')}

@api_router.post("/leaves")
async def create_leave(l: Leave, role: str = Depends(get_current)):
    doc = l.dict()
    collections = {'Student': 'students', 'Teacher': 'teachers', 'Staff': 'staff'}
    collection = collections.get(doc.get('person_type'))
    if not collection or not doc.get('person_id'):
        raise HTTPException(status_code=422, detail='Choose Student, Teacher or Staff and select the person.')
    person = await db[collection].find_one({'id': doc['person_id']})
    if not person:
        raise HTTPException(status_code=422, detail='The selected person is no longer available.')
    try:
        start = datetime.strptime(doc['from_date'], '%Y-%m-%d').date()
        end = datetime.strptime(doc['to_date'], '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=422, detail='Choose valid From and To dates.')
    if end < start:
        raise HTTPException(status_code=422, detail='To date cannot be before From date.')
    doc['name'] = person.get('name', doc['name'])
    doc['days'] = (end - start).days + 1
    doc['class_name'] = person.get('class_name', doc.get('class_name', '')) if doc['person_type'] == 'Student' else ''
    doc['section'] = person.get('section', doc.get('section', '')) if doc['person_type'] == 'Student' else ''
    doc['avatar'] = person.get('avatar', doc.get('avatar', ''))
    doc['submitted_at'] = doc.get('submitted_at') or datetime.utcnow().isoformat()
    doc['created'] = doc.get('created') or datetime.utcnow().isoformat()
    doc['submitted_by'] = ROLE_CONFIG[role]['name']
    doc['attachment_name'] = doc.get('attachment_name', '')
    doc['attachment_url'] = doc.get('attachment_url', '')
    doc['attachment_type'] = doc.get('attachment_type', '')
    await db.leaves.insert_one(dict(doc))
    await add_event('info', 'New leave request', f"{doc['name']} requested {doc['leave_type']} ({doc['from_date']} - {doc['to_date']}).")
    return doc

@api_router.put("/leaves/{lid}/status")
async def set_leave_status(lid: str, status: str, role: str = Depends(get_current)):
    if status not in {'Approved', 'Rejected', 'Pending'}:
        raise HTTPException(status_code=422, detail='Choose Approved, Rejected or Pending.')
    await db.leaves.update_one({'id': lid}, {'$set': {'status': status, 'reviewed_by': ROLE_CONFIG[role]['name'], 'reviewed_at': datetime.utcnow().isoformat()}})
    doc = await db.leaves.find_one({'id': lid})
    if not doc:
        raise HTTPException(status_code=404, detail='Leave request not found.')
    await add_event('success' if status == 'Approved' else 'info', 'Leave request updated', f"{doc.get('name', 'Leave request')} was {status.lower()}.")
    return clean(doc)

# ---------------- Teachers ----------------
@api_router.get("/teachers")
async def list_teachers(role: str = Depends(get_current)):
    docs = await db.teachers.find().sort('name', 1).to_list(1000)
    return [clean(d) for d in docs]

def teacher_record(payload: dict, teacher_id: str = ''):
    name = str(payload.get('name') or payload.get('teacher_name') or '').strip()
    if not name:
        raise HTTPException(status_code=422, detail='Teacher name is required.')
    employee_id = str(teacher_id or payload.get('employee_id') or payload.get('id') or '').strip() or f"TCH-{uuid.uuid4().hex[:8].upper()}"
    return {
        'id': employee_id, 'name': name,
        'subject': str(payload.get('primary_subject') if 'primary_subject' in payload else payload.get('subject') or '').strip(),
        'phone': str(payload.get('phone') or '').strip(), 'email': str(payload.get('email') or '').strip(),
        'qualification': str(payload.get('qualification') or '').strip(),
        'status': str(payload.get('status') or 'Active').strip() or 'Active',
        'avatar': str(payload.get('avatar') or 'https://i.pravatar.cc/80?img=12').strip(),
        'created': payload.get('created') or datetime.utcnow().isoformat(),
    }

@api_router.post("/teachers")
async def create_teacher(payload: dict, role: str = Depends(get_current)):
    doc = teacher_record(payload)
    if await db.teachers.find_one({'id': doc['id']}):
        raise HTTPException(status_code=409, detail='That employee ID already exists.')
    if doc['email'] and await db.teachers.find_one({'email': doc['email']}):
        raise HTTPException(status_code=409, detail='That email is already used by another teacher.')
    await db.teachers.insert_one(dict(doc))
    await add_event('success', 'Teacher added', f"{doc['name']} was added to the teacher directory.")
    return doc

@api_router.put("/teachers/{teacher_id}")
async def update_teacher(teacher_id: str, payload: dict, role: str = Depends(get_current)):
    old = await db.teachers.find_one({'id': teacher_id})
    if not old:
        raise HTTPException(status_code=404, detail='Teacher not found.')
    doc = teacher_record({**old, **payload}, teacher_id=teacher_id)
    if doc['email']:
        duplicate = await db.teachers.find_one({'email': doc['email'], 'id': {'$ne': teacher_id}})
        if duplicate:
            raise HTTPException(status_code=409, detail='That email is already used by another teacher.')
    await db.teachers.update_one({'id': teacher_id}, {'$set': doc})
    return doc

@api_router.get("/teachers-template")
async def teachers_template(role: str = Depends(get_current)):
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(['teacher_name', 'employee_id', 'phone', 'email', 'primary_subject', 'qualification', 'status'])
    writer.writerow(['Anita Rao', 'TCH-1001', '9876543210', 'anita@example.com', 'Mathematics', 'B.Ed, M.Sc', 'Active'])
    return PlainTextResponse(buf.getvalue(), media_type='text/csv', headers={'Content-Disposition': 'attachment; filename=teachers-template.csv'})

@api_router.post("/teachers/bulk")
async def bulk_upload_teachers(file: UploadFile = File(...), role: str = Depends(get_current)):
    content = (await file.read()).decode('utf-8', errors='ignore')
    reader = csv.DictReader(io.StringIO(content))
    inserted, errors = 0, []
    for row_number, row in enumerate(reader, start=2):
        try:
            doc = teacher_record(row)
            if await db.teachers.find_one({'id': doc['id']}):
                errors.append({'row': row_number, 'error': 'Duplicate employee ID'})
                continue
            if doc['email'] and await db.teachers.find_one({'email': doc['email']}):
                errors.append({'row': row_number, 'error': 'Duplicate email'})
                continue
            await db.teachers.insert_one(dict(doc))
            inserted += 1
        except HTTPException as error:
            errors.append({'row': row_number, 'error': error.detail})
    if inserted:
        await add_event('success', 'Teachers imported', f"{inserted} teacher(s) were added via CSV upload.")
    return {'inserted': inserted, 'errors': errors}

# ---------------- Teaching excellence ----------------
@api_router.get("/teaching/setup")
async def teaching_setup(role: str = Depends(get_current)):
    teachers = await db.teachers.count_documents({})
    students = await db.students.count_documents({})
    allocations = await db.teacher_allocations.count_documents({})
    return {
        'academic_year': '2026-2027',
        'checklist': [
            {'key': 'teachers', 'label': 'Add teacher details', 'complete': teachers > 0},
            {'key': 'students', 'label': 'Add student details', 'complete': students > 0},
            {'key': 'allocations', 'label': 'Allocate subject teachers', 'complete': allocations > 0},
            {'key': 'calendar', 'label': 'Set up academic calendar', 'complete': False},
        ],
        'allocations': [clean(d) for d in await db.teacher_allocations.find().sort('teacher_name', 1).to_list(1000)],
    }

@api_router.post("/teacher-allocations")
async def create_teacher_allocation(a: TeacherAllocation, role: str = Depends(get_current)):
    teacher = await db.teachers.find_one({'id': a.teacher_id})
    if not teacher:
        raise HTTPException(status_code=422, detail='Choose a teacher from the teacher directory.')
    structure = await db.academic_structure.find_one({'id': 'school-structure'})
    class_item = next((item for item in (structure or {}).get('classes', []) if item.get('name') == a.class_name), None)
    section_item = next((item for item in (class_item or {}).get('sections', []) if item.get('name') == a.section), None)
    if not section_item or a.subject not in (section_item.get('subjects') or []):
        raise HTTPException(status_code=422, detail='Choose a Class, Section and Subject from Academic Setup.')
    existing = await db.teacher_allocations.find_one({'class_name': a.class_name, 'section': a.section, 'subject': a.subject})
    if existing:
        raise HTTPException(status_code=409, detail=f"{a.subject} is already allocated for {a.class_name} {a.section}.")
    doc = a.dict()
    doc['teacher_name'] = teacher.get('name', '')
    doc['academic_year'] = (structure or {}).get('academic_year') or a.academic_year
    await db.teacher_allocations.insert_one(dict(doc))
    await add_event('info', 'Teacher allocated', f"{doc['teacher_name']} was allocated to {doc['subject']} for {doc['class_name']} {doc['section']}.")
    return doc

@api_router.get("/teacher-allocations")
async def list_teacher_allocations(role: str = Depends(get_current)):
    return [clean(doc) for doc in await db.teacher_allocations.find().sort([('class_name', 1), ('section', 1), ('subject', 1)]).to_list(1000)]

@api_router.delete("/teacher-allocations/{aid}")
async def delete_teacher_allocation(aid: str, role: str = Depends(get_current)):
    await db.teacher_allocations.delete_one({'id': aid})
    return {'ok': True}

# ---------------- Timetable ----------------
TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

def timetable_minutes(value: str) -> int:
    try:
        hour, minute = str(value).split(':', 1)
        return int(hour) * 60 + int(minute)
    except (ValueError, TypeError):
        raise HTTPException(status_code=422, detail='Enter valid start and end times.')

@api_router.get("/timetable-periods")
async def list_timetable_periods(role: str = Depends(get_current)):
    rows = await db.timetable_periods.find().to_list(2000)
    day_order = {day: index for index, day in enumerate(TIMETABLE_DAYS)}
    return [clean(row) for row in sorted(rows, key=lambda row: (row.get('class_name', ''), row.get('section', ''), day_order.get(row.get('day'), 99), row.get('start_time', '')))]

@api_router.post("/timetable-periods")
async def create_timetable_period(period: TimetablePeriod, role: str = Depends(get_current)):
    if period.day not in TIMETABLE_DAYS:
        raise HTTPException(status_code=422, detail='Choose a valid school day.')
    start, end = timetable_minutes(period.start_time), timetable_minutes(period.end_time)
    if end <= start:
        raise HTTPException(status_code=422, detail='End time must be after the start time.')
    structure = await db.academic_structure.find_one({'id': 'school-structure'})
    class_item = next((item for item in (structure or {}).get('classes', []) if item.get('name') == period.class_name), None)
    section_item = next((item for item in (class_item or {}).get('sections', []) if item.get('name') == period.section), None)
    if not section_item or period.subject not in (section_item.get('subjects') or []):
        raise HTTPException(status_code=422, detail='Choose a Class, Section and Subject from Academic Setup.')
    allocation = await db.teacher_allocations.find_one({'class_name': period.class_name, 'section': period.section, 'subject': period.subject})
    if not allocation:
        raise HTTPException(status_code=422, detail='Assign a teacher to this Class, Section and Subject before creating its timetable period.')
    day_rows = await db.timetable_periods.find({'day': period.day}).to_list(2000)
    for row in day_rows:
        row_start, row_end = timetable_minutes(row.get('start_time')), timetable_minutes(row.get('end_time'))
        overlaps = start < row_end and end > row_start
        same_group = row.get('class_name') == period.class_name and row.get('section') == period.section
        same_teacher = row.get('teacher_id') == allocation.get('teacher_id')
        if overlaps and same_group:
            raise HTTPException(status_code=409, detail='This Class and Section already has a period during that time.')
        if overlaps and same_teacher:
            raise HTTPException(status_code=409, detail=f"{allocation.get('teacher_name')} is already scheduled at this time.")
    doc = period.dict()
    doc['teacher_id'] = allocation.get('teacher_id', '')
    doc['teacher_name'] = allocation.get('teacher_name', '')
    doc['academic_year'] = (structure or {}).get('academic_year') or period.academic_year
    doc['created'] = datetime.utcnow().isoformat()
    await db.timetable_periods.insert_one(dict(doc))
    await add_event('info', 'Timetable updated', f"{doc['subject']} was scheduled for {doc['class_name']} {doc['section']} on {doc['day']}.")
    return doc

@api_router.delete("/timetable-periods/{period_id}")
async def delete_timetable_period(period_id: str, role: str = Depends(get_current)):
    result = await db.timetable_periods.delete_one({'id': period_id})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail='Timetable period not found.')
    return {'ok': True}

# ---------------- Inventory ----------------
INVENTORY_CATEGORIES = ['Textbooks & Workbooks', 'Stationery', 'Laboratory', 'Sports', 'IT & Electronics', 'Furniture & Fixtures', 'Uniforms', 'Transport', 'Housekeeping', 'Other']

def inventory_stock_status(item: dict) -> str:
    quantity = int(item.get('quantity') or 0)
    reorder_level = int(item.get('reorder_level') or 0)
    if quantity <= 0:
        return 'Out of Stock'
    if reorder_level and quantity <= reorder_level:
        return 'Low Stock'
    return 'In Stock'

def inventory_public(item: dict) -> dict:
    row = clean(item)
    row['stock_status'] = inventory_stock_status(row)
    row['stock_value'] = round(float(row.get('quantity') or 0) * float(row.get('unit_price') or 0), 2)
    return row

@api_router.get("/inventory/items")
async def list_inventory_items(role: str = Depends(get_current)):
    rows = await db.inventory_items.find().sort('item_name', 1).to_list(2000)
    return [inventory_public(row) for row in rows]

@api_router.post("/inventory/items")
async def create_inventory_item(item: InventoryItem, role: str = Depends(get_current)):
    name = item.item_name.strip()
    if not name:
        raise HTTPException(status_code=422, detail='Enter an item name.')
    if item.sku.strip() and await db.inventory_items.find_one({'sku': item.sku.strip()}):
        raise HTTPException(status_code=409, detail='This SKU already exists. Use a unique SKU for each stock item.')
    doc = item.dict()
    doc['item_name'] = name
    doc['sku'] = doc['sku'].strip()
    doc['created'] = datetime.utcnow().isoformat()
    doc['updated'] = doc['created']
    await db.inventory_items.insert_one(dict(doc))
    await db.inventory_transactions.insert_one({
        'id': str(uuid.uuid4()), 'item_id': doc['id'], 'item_name': doc['item_name'], 'category': doc['category'],
        'transaction_type': 'Opening Stock', 'quantity': doc['quantity'], 'balance_after': doc['quantity'],
        'unit': doc['unit'], 'reference': 'Initial stock entry', 'issue_to': '', 'recipient': '', 'notes': doc['notes'],
        'created': doc['created'], 'recorded_by': ROLE_CONFIG.get(role, {}).get('name', role),
    })
    await add_event('info', 'Inventory item added', f"{doc['item_name']} was added to the school inventory.")
    return inventory_public(doc)

@api_router.put("/inventory/items/{item_id}")
async def update_inventory_item(item_id: str, item: InventoryItem, role: str = Depends(get_current)):
    current = await db.inventory_items.find_one({'id': item_id})
    if not current:
        raise HTTPException(status_code=404, detail='Inventory item not found.')
    duplicate_sku = item.sku.strip() and await db.inventory_items.find_one({'sku': item.sku.strip(), 'id': {'$ne': item_id}})
    if duplicate_sku:
        raise HTTPException(status_code=409, detail='This SKU already exists. Use a unique SKU for each stock item.')
    doc = item.dict()
    doc['id'] = item_id
    doc['item_name'] = doc['item_name'].strip()
    doc['sku'] = doc['sku'].strip()
    doc['updated'] = datetime.utcnow().isoformat()
    await db.inventory_items.replace_one({'id': item_id}, doc)
    await add_event('info', 'Inventory item updated', f"Details for {doc['item_name']} were updated.")
    return inventory_public(doc)

@api_router.post("/inventory/items/{item_id}/movement")
async def create_inventory_movement(item_id: str, payload: dict, role: str = Depends(get_current)):
    item = await db.inventory_items.find_one({'id': item_id})
    if not item:
        raise HTTPException(status_code=404, detail='Inventory item not found.')
    movement_type = str(payload.get('transaction_type') or '').strip()
    if movement_type not in ('Stock In', 'Issue'):
        raise HTTPException(status_code=422, detail='Choose Stock In or Issue.')
    try:
        quantity = int(payload.get('quantity') or 0)
    except (TypeError, ValueError):
        quantity = 0
    if quantity <= 0:
        raise HTTPException(status_code=422, detail='Enter a quantity greater than zero.')
    if movement_type == 'Issue' and quantity > int(item.get('quantity') or 0):
        raise HTTPException(status_code=422, detail=f"Only {item.get('quantity', 0)} {item.get('unit', 'units')} are currently available.")
    if movement_type == 'Issue' and not str(payload.get('issue_to') or '').strip():
        raise HTTPException(status_code=422, detail='Choose where these items are being issued.')
    new_quantity = int(item.get('quantity') or 0) + quantity if movement_type == 'Stock In' else int(item.get('quantity') or 0) - quantity
    now = datetime.utcnow().isoformat()
    await db.inventory_items.update_one({'id': item_id}, {'$set': {'quantity': new_quantity, 'updated': now}})
    transaction = {
        'id': str(uuid.uuid4()), 'item_id': item_id, 'item_name': item.get('item_name', ''), 'category': item.get('category', ''),
        'transaction_type': movement_type, 'quantity': quantity, 'balance_after': new_quantity, 'unit': item.get('unit', 'Units'),
        'reference': str(payload.get('reference') or '').strip(), 'issue_to': str(payload.get('issue_to') or '').strip(),
        'recipient': str(payload.get('recipient') or '').strip(), 'notes': str(payload.get('notes') or '').strip(),
        'created': now, 'recorded_by': ROLE_CONFIG.get(role, {}).get('name', role),
    }
    await db.inventory_transactions.insert_one(dict(transaction))
    action_text = 'received into stock' if movement_type == 'Stock In' else f"issued to {transaction['issue_to']}"
    await add_event('info', 'Inventory movement recorded', f"{quantity} {item.get('unit', 'units')} of {item.get('item_name')} were {action_text}.")
    updated = await db.inventory_items.find_one({'id': item_id})
    return {'item': inventory_public(updated), 'transaction': clean(transaction)}

@api_router.post("/inventory/items/{item_id}/purchase")
async def purchase_inventory_item(item_id: str, payload: dict, role: str = Depends(get_current)):
    """Receive a purchased stock item and automatically record the outgoing payment."""
    item = await db.inventory_items.find_one({'id': item_id})
    if not item:
        raise HTTPException(status_code=404, detail='Inventory item not found.')
    try:
        quantity = int(payload.get('quantity') or 0)
        unit_cost = float(payload.get('unit_cost') or 0)
    except (TypeError, ValueError):
        quantity = 0; unit_cost = 0
    supplier = str(payload.get('supplier') or '').strip()
    purchase_date = str(payload.get('purchase_date') or '').strip()
    if quantity <= 0 or unit_cost < 0 or not supplier or not purchase_date:
        raise HTTPException(status_code=422, detail='Choose the date, supplier, quantity and a valid unit cost.')
    now = datetime.utcnow().isoformat()
    total = round(quantity * unit_cost, 2)
    new_quantity = int(item.get('quantity') or 0) + quantity
    item_category = str(item.get('category') or '')
    expense_category = 'Books & Academic' if item_category == 'Textbooks & Workbooks' else ('Stationery & Supplies' if item_category == 'Stationery' else 'Other')
    expense = {
        'id': str(uuid.uuid4()), 'expense_date': purchase_date, 'category': expense_category,
        'paid_to': supplier, 'description': f"Purchase: {quantity} {item.get('unit', 'Units')} of {item.get('item_name', '')}",
        'amount': total, 'payment_method': str(payload.get('payment_method') or 'Cash').strip(),
        'reference': str(payload.get('reference') or '').strip(), 'notes': str(payload.get('notes') or '').strip(),
        'created': now, 'recorded_by': ROLE_CONFIG.get(role, {}).get('name', role), 'inventory_item_id': item_id,
    }
    await db.expenses.insert_one(dict(expense))
    await db.inventory_items.update_one({'id': item_id}, {'$set': {'quantity': new_quantity, 'unit_price': unit_cost, 'supplier': supplier, 'updated': now}})
    transaction = {
        'id': str(uuid.uuid4()), 'item_id': item_id, 'item_name': item.get('item_name', ''), 'category': item_category,
        'transaction_type': 'Purchase Received', 'quantity': quantity, 'balance_after': new_quantity,
        'unit': item.get('unit', 'Units'), 'reference': expense['reference'], 'issue_to': '', 'recipient': supplier,
        'notes': expense['notes'], 'created': now, 'recorded_by': ROLE_CONFIG.get(role, {}).get('name', role),
        'expense_id': expense['id'],
    }
    await db.inventory_transactions.insert_one(dict(transaction))
    await add_event('success', 'Stock purchased and expense recorded', f"{quantity} {item.get('unit', 'units')} of {item.get('item_name')} were received; ₹{total:,.2f} was recorded as an expense.")
    return {'item': inventory_public(await db.inventory_items.find_one({'id': item_id})), 'expense': clean(expense), 'transaction': clean(transaction)}

@api_router.post("/inventory/items/{item_id}/issue-to-parent")
async def issue_inventory_to_parent(item_id: str, payload: dict, role: str = Depends(get_current)):
    """Issue a stocked book/item to a parent and create a matching student fee head."""
    item = await db.inventory_items.find_one({'id': item_id})
    if not item:
        raise HTTPException(status_code=404, detail='Inventory item not found.')
    student_id = str(payload.get('student_id') or '').strip()
    student = await db.students.find_one({'id': student_id})
    if not student:
        raise HTTPException(status_code=422, detail='Choose the student receiving this item.')
    try:
        quantity = int(payload.get('quantity') or 0)
        unit_price = float(payload.get('unit_price') or 0)
    except (TypeError, ValueError):
        quantity = 0; unit_price = 0
    if quantity <= 0 or unit_price <= 0:
        raise HTTPException(status_code=422, detail='Enter a quantity and the amount to charge the parent.')
    if quantity > int(item.get('quantity') or 0):
        raise HTTPException(status_code=422, detail=f"Only {item.get('quantity', 0)} {item.get('unit', 'units')} are currently available.")
    now = datetime.utcnow().isoformat()
    total = round(quantity * unit_price, 2)
    new_quantity = int(item.get('quantity') or 0) - quantity
    issue_id = f"INV-ISSUE-{uuid.uuid4().hex[:10].upper()}"
    structure = await db.academic_structure.find_one({'id': 'school-structure'}) or {}
    academic_year = str(student.get('academic_year') or structure.get('academic_year') or '').strip()
    fee = {
        'id': f"FEE-{uuid.uuid4().hex[:8].upper()}", 'inventory_issue_id': issue_id, 'student_id': student_id,
        'name': student.get('name', ''), 'avatar': student.get('avatar', ''), 'fee_name': item.get('item_name', 'School Item'),
        'category': 'Books & Academic', 'description': f"{quantity} {item.get('unit', 'Units')} issued from school stock",
        'academic_year': academic_year, 'due_date': str(payload.get('due_date') or '').strip(),
        'total': total, 'paid': 0, 'discount': 0, 'due': total, 'status': 'Unpaid', 'created': now,
    }
    await db.fees.insert_one(dict(fee))
    await db.inventory_items.update_one({'id': item_id}, {'$set': {'quantity': new_quantity, 'updated': now}})
    transaction = {
        'id': str(uuid.uuid4()), 'item_id': item_id, 'item_name': item.get('item_name', ''), 'category': item.get('category', ''),
        'transaction_type': 'Issued to Parent', 'quantity': quantity, 'balance_after': new_quantity, 'unit': item.get('unit', 'Units'),
        'reference': str(payload.get('reference') or '').strip(), 'issue_to': 'Parent', 'recipient': student.get('name', ''),
        'notes': str(payload.get('notes') or '').strip(), 'created': now, 'recorded_by': ROLE_CONFIG.get(role, {}).get('name', role),
        'student_id': student_id, 'fee_id': fee['id'], 'inventory_issue_id': issue_id,
    }
    await db.inventory_transactions.insert_one(dict(transaction))
    await sync_student_fee_balance(student_id)
    await add_event('success', 'Item issued to parent', f"{item.get('item_name')} was issued to {student.get('name')} and ₹{total:,.2f} was added to the student fee account.")
    return {'item': inventory_public(await db.inventory_items.find_one({'id': item_id})), 'fee': clean(fee), 'transaction': clean(transaction)}

@api_router.get("/inventory/transactions")
async def list_inventory_transactions(role: str = Depends(get_current)):
    rows = await db.inventory_transactions.find().sort('created', -1).to_list(3000)
    return [clean(row) for row in rows]

# ---------------- Expenses ----------------
@api_router.get("/expenses")
async def list_expenses(role: str = Depends(get_current)):
    rows = await db.expenses.find().sort([('expense_date', -1), ('created', -1)]).to_list(3000)
    return [clean(row) for row in rows]

@api_router.post("/expenses")
async def create_expense(expense: ExpenseEntry, role: str = Depends(get_current)):
    if not expense.expense_date.strip():
        raise HTTPException(status_code=422, detail='Choose the expense date.')
    if not expense.category.strip() or not expense.paid_to.strip() or not expense.description.strip():
        raise HTTPException(status_code=422, detail='Category, paid to and description are required.')
    doc = expense.dict()
    doc['paid_to'] = doc['paid_to'].strip()
    doc['description'] = doc['description'].strip()
    doc['category'] = doc['category'].strip()
    doc['reference'] = doc['reference'].strip()
    doc['notes'] = doc['notes'].strip()
    doc['created'] = datetime.utcnow().isoformat()
    doc['recorded_by'] = ROLE_CONFIG.get(role, {}).get('name', role)
    await db.expenses.insert_one(dict(doc))
    await add_event('info', 'Expense recorded', f"₹{doc['amount']:,.2f} was recorded under {doc['category']}.")
    return clean(doc)

@api_router.get("/classroom-observations")
async def list_classroom_observations(role: str = Depends(get_current)):
    docs = await db.classroom_observations.find().sort('observation_date', -1).to_list(1000)
    return [clean(d) for d in docs]

@api_router.post("/classroom-observations")
async def create_classroom_observation(o: ClassroomObservation, role: str = Depends(get_current)):
    if role not in ('admin', 'academic_coordinator'):
        raise HTTPException(status_code=403, detail='Only Admin or Academic Coordinator can record a classroom observation.')
    doc = o.dict()
    allocation = await db.teacher_allocations.find_one({'teacher_id': doc['teacher_id'], 'class_name': doc['class_name'], 'section': doc['section'], 'subject': doc['subject']})
    if not allocation:
        raise HTTPException(status_code=422, detail='Select the teacher allocated to this exact class, section and subject.')
    doc['total_score'] = doc['plan_score'] + doc['behaviour_score'] + doc['engagement_score']
    doc['recorded_by'] = ROLE_CONFIG[role]['name']
    doc['created'] = datetime.utcnow().isoformat()
    await db.classroom_observations.insert_one(dict(doc))
    await add_event('info', 'Classroom observation added', f"Observation recorded for {doc['teacher_name']} in {doc['class_name']}.")
    return doc

@api_router.delete("/classroom-observations/{oid}")
async def delete_classroom_observation(oid: str, role: str = Depends(get_current)):
    await db.classroom_observations.delete_one({'id': oid})
    return {'ok': True}

@api_router.get("/teacher-performance")
async def teacher_performance(role: str = Depends(get_current)):
    teachers = [clean(d) for d in await db.teachers.find().to_list(1000)]
    observations = [clean(d) for d in await db.classroom_observations.find().to_list(1000)]
    by_teacher = {}
    for o in observations:
        key = o.get('teacher_id') or o.get('teacher_name')
        by_teacher.setdefault(key, []).append(o)
    rows = []
    for teacher in teachers:
        key = teacher.get('id') or teacher.get('name')
        records = by_teacher.get(key, [])
        observation_average = round(sum(x.get('total_score', 0) for x in records) / len(records), 1) if records else 0
        score = round((observation_average / 15) * 100, 1) if records else 0
        rows.append({'teacher_id': teacher.get('id'), 'teacher_name': teacher.get('name'),
                     'subject': teacher.get('subject', ''), 'observations': len(records),
                     'observation_average': observation_average, 'performance_score': score})
    rows.sort(key=lambda x: x['performance_score'], reverse=True)
    return {'rows': rows, 'doing_well': [x for x in rows if x['performance_score'] >= 75],
            'needs_support': [x for x in rows if x['observations'] and x['performance_score'] < 75]}

# ---------------- Global Search ----------------
@api_router.get("/search")
async def search(q: str = "", role: str = Depends(get_current)):
    q = (q or "").strip()
    if not q:
        return {'students': [], 'teachers': [], 'classes': []}
    rx = {'$regex': q, '$options': 'i'}
    students = await db.students.find({'$or': [{'name': rx}, {'id': rx}, {'class_name': rx}]}).to_list(8)
    teachers = await db.teachers.find({'$or': [{'name': rx}, {'subject': rx}]}).to_list(8)
    # classes derived from students
    all_students = await db.students.find().to_list(1000)
    classes = sorted({s.get('class_name', '') for s in all_students if q.lower() in s.get('class_name', '').lower() and s.get('class_name')})
    return {
        'students': [{'id': s['id'], 'name': s['name'], 'class_name': s.get('class_name', ''), 'avatar': s.get('avatar', '')} for s in students],
        'teachers': [{'id': t['id'], 'name': t['name'], 'subject': t.get('subject', ''), 'avatar': t.get('avatar', '')} for t in teachers],
        'classes': [{'name': c} for c in classes],
    }

# ---------------- Analytics ----------------
@api_router.get("/analytics/dashboard")
async def analytics_dashboard(role: str = Depends(get_current)):
    students = await db.students.find().to_list(1000)
    teachers = await db.teachers.find().to_list(1000)
    fees = await db.fees.find().to_list(1000)
    collected = sum(f.get('paid', 0) for f in fees)
    return {
        'stats': {
            'students': len(students),
            'teachers': len(teachers),
            'fees_collected': collected,
            'attendance': None,
        },
        'attendance_trend': [],
        'fees_trend': [],
    }

@api_router.get("/analytics/ai")
async def analytics_ai(role: str = Depends(get_current)):
    # subject scores derived from saved marks sets (fallback to defaults)
    sets = await db.marks_sets.find().to_list(100)
    agg = {}
    for ms in sets:
        subj = (ms.get('subject') or 'Subject').split()[-1] if ms.get('subject') else 'Subject'
        tm = ms.get('total_max', 100) or 100
        for r in ms.get('rows', []):
            pct = (r.get('total', 0) / tm) * 100
            agg.setdefault(subj, []).append(pct)
    if agg:
        subject_scores = [{'subject': k, 'score': round(sum(v) / len(v))} for k, v in agg.items()]
    else:
        subject_scores = []
    students = await db.students.count_documents({})
    risks = (await detect_academic_risks())['risks']
    return {
        'kpis': {'pass_rate': 0, 'at_risk': len(risks), 'engagement': 0, 'forecast_revenue': '₹0'},
        'performance_trend': [],
        'subject_scores': subject_scores,
        'risk_distribution': [{'name': 'Safe', 'value': max(0, students - len(risks))}, {'name': 'At-Risk', 'value': len(risks)}],
    }

# ---------------- Per-student detail ----------------
DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science']

def grade_for(total):
    if total >= 90: return 'A+'
    if total >= 80: return 'A'
    if total >= 70: return 'B+'
    if total >= 60: return 'B'
    if total >= 40: return 'C'
    return 'F'

def build_attendance(sid):
    seed = sum(ord(c) for c in sid)
    absent = {(3 + seed % 5), (10 + seed % 3) + 7}
    late = {(1 + seed % 3), (16 + seed % 2)}
    days = []
    # July 2025 starts on Tuesday -> 2 leading blanks
    days += [{'day': None}, {'day': None}]
    for d in range(1, 32):
        idx = (d + 1) % 7  # 0=Sun ... after 2 blanks
        dow = (1 + d) % 7  # July1=Tue => index2
        col = (d + 1) % 7
        is_weekend = col in (0, 6)
        if is_weekend:
            days.append({'day': d, 'status': 'weekend'})
        elif d in absent:
            days.append({'day': d, 'status': 'absent'})
        elif d in late:
            days.append({'day': d, 'status': 'late'})
        else:
            days.append({'day': d, 'status': 'present'})
    while len(days) % 7 != 0:
        days.append({'day': None})
    working = len([x for x in days if x.get('status') and x['status'] != 'weekend'])
    present = len([x for x in days if x.get('status') == 'present'])
    late_c = len([x for x in days if x.get('status') == 'late'])
    absent_c = len([x for x in days if x.get('status') == 'absent'])
    rate = round((present + late_c) / working * 100, 1) if working else 0
    logs = [
        {'date': 'Jul 31, 2025', 'status': 'Present', 'in': '08:14 AM', 'out': '02:30 PM'},
        {'date': 'Jul 30, 2025', 'status': 'Present', 'in': '08:10 AM', 'out': '02:35 PM'},
        {'date': 'Jul 29, 2025', 'status': 'Present', 'in': '08:15 AM', 'out': '02:32 PM'},
        {'date': 'Jul 28, 2025', 'status': 'Present', 'in': '08:20 AM', 'out': '02:30 PM'},
        {'date': 'Jul 25, 2025', 'status': 'Absent', 'in': '--', 'out': '--'},
        {'date': 'Jul 24, 2025', 'status': 'Present', 'in': '08:12 AM', 'out': '02:31 PM'},
    ]
    return {
        'month': 'July 2025', 'days': days,
        'stats': {'rate': f"{rate}%", 'totalWorking': f"{working} days", 'totalPresent': f"{present} days",
                  'lateArrivals': f"{late_c} days", 'absentDays': f"{absent_c} days"},
        'logs': logs,
    }

async def build_marks_for(name, sid):
    rows = []
    sets = await db.marks_sets.find().to_list(100)
    for ms in sets:
        for r in ms.get('rows', []):
            if r.get('name', '').lower() == (name or '').lower():
                rows.append({'subject': ms.get('subject', 'Subject'),
                             'internal': r.get('practical', 0), 'external': r.get('written', 0),
                             'total': r.get('total', 0), 'grade': grade_for(r.get('total', 0))})
    if not rows:
        seed = sum(ord(c) for c in sid)
        base = 82 + seed % 12
        for i, subj in enumerate(DEFAULT_SUBJECTS):
            total = min(99, base + ((seed + i * 7) % 15) - 5)
            internal = round(total * 0.28)
            rows.append({'subject': subj, 'internal': internal, 'external': total - internal,
                         'total': total, 'grade': grade_for(total)})
    return rows

@api_router.get("/students/{sid}/detail")
async def student_detail(sid: str, role: str = Depends(get_current)):
    student = await db.students.find_one({'id': sid})
    if not student:
        raise HTTPException(status_code=404, detail="Not found")
    student = clean(student)
    fee = await db.fees.find_one({'student_id': sid}) or await db.fees.find_one({'name': student.get('name')})
    due = fee.get('due', 0) if fee else 0
    pending = []
    if due > 0:
        pending = [
            {'checked': True, 'desc': 'Tuition Fee - Quarter 2', 'sub': 'Standard term tuition',
             'due': 'Oct 15, 2024', 'amount': f"\u20b9{due:,.2f}", 'status': 'OVERDUE'},
            {'checked': True, 'desc': 'Library Membership', 'sub': 'Annual digital & physical access',
             'due': 'Nov 01, 2024', 'amount': '\u20b9150.00', 'status': 'PENDING'},
        ]
    marks = await build_marks_for(student.get('name'), sid)
    cgpa = round(sum(m['total'] for m in marks) / len(marks) / 10, 2) if marks else 0
    att = build_attendance(sid)
    seed = sum(ord(c) for c in sid)
    return {
        'student': {
            'name': student.get('name'), 'id': student.get('id'),
            'className': f"{student.get('class_name','')} - {student.get('section','').replace('Section ','')}".strip(' -'),
            'roll': student.get('roll', ''), 'balance': f"\u20b9{due:,.2f}", 'status': student.get('status', 'Active'),
            'avatar': student.get('avatar', ''), 'admission_no': student.get('admission_no', ''),
            'raw': student,
        },
        'fees': {'pending': pending, 'total': f"\u20b9{due:,.2f}", 'due': due,
                 'fee_id': fee.get('id') if fee else None},
        'marks': marks,
        'gpa': {'cgpa': f"{cgpa}", 'grade': grade_for(marks[0]['total'] if marks else 0) + ' (Excellent)',
                'credits': '24 / 24', 'standing': 'First Class with Distinction'},
        'standing': {'rank': f"{(seed % 40) + 1:02d} / 45 Students", 'percentile': f"{88 + seed % 11}.0% Percentile"},
        'attendance': att,
    }

# ---------------- Marks & Results ----------------
class MarksSet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_id: str = ""
    exam_title: str
    class_name: str = ""
    section: str = ""
    subject: str = ""
    max_written: int = 70
    max_practical: int = 30
    passing_marks: int = 40
    grade_scheme: List[dict] = []
    rows: List[dict] = []
    created: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

@api_router.post("/marks")
async def save_marks(ms: MarksSet, role: str = Depends(get_current)):
    doc = ms.dict()
    if doc.get('exam_id'):
        exam = await db.exams.find_one({'id': doc['exam_id']})
        if not exam:
            raise HTTPException(status_code=404, detail='The selected exam no longer exists.')
        if exam.get('class_name') != doc.get('class_name') or exam.get('section') != doc.get('section'):
            raise HTTPException(status_code=422, detail='Marks must use the selected exam class and section.')
        allowed_subjects = exam.get('subjects') or [exam.get('subject')]
        if doc.get('subject') not in allowed_subjects:
            raise HTTPException(status_code=422, detail='Choose a subject included in the selected exam.')
    total_max = doc['max_written'] + doc['max_practical']
    for r in doc['rows']:
        r['total'] = (r.get('written', 0) or 0) + (r.get('practical', 0) or 0)
    doc['total_max'] = total_max
    await db.marks_sets.insert_one(dict(doc))
    # New marks immediately refresh the academic-risk engine.
    await detect_academic_risks(create_cases=True)
    await add_event('info', 'Marks submitted', f"{doc['subject']} marks for {doc['class_name']} {doc['section']} were finalized.")
    return clean(doc)

@api_router.get("/results")
async def results(class_name: str = '', section: str = '', role: str = Depends(get_current)):
    # A result set is selected by its real Class and Section. This prevents
    # showing a different class's latest marks by mistake.
    all_sets = await db.marks_sets.find().sort('created', -1).to_list(5000)
    groups = sorted(
        [{'class_name': item.get('class_name', ''), 'section': item.get('section', '')}
         for item in all_sets if item.get('class_name') and item.get('section')],
        key=lambda item: (item['class_name'], item['section'])
    )
    unique_groups = []
    seen_groups = set()
    for group in groups:
        key = (group['class_name'], group['section'])
        if key not in seen_groups:
            unique_groups.append(group)
            seen_groups.add(key)

    if not class_name or not section:
        return {'available_groups': unique_groups, 'selected': False, 'rows': [], 'class_average': 0, 'highest': 0, 'pass_rate': 0, 'students': 0}

    latest = [item for item in all_sets if item.get('class_name') == class_name and item.get('section') == section]
    if not latest:
        return {'available_groups': unique_groups, 'selected': True, 'exam_title': '\u2014', 'class': f'{class_name} - {section}', 'rows': [], 'class_average': 0, 'highest': 0, 'pass_rate': 0, 'students': 0}
    ms = latest[0]
    total_max = ms.get('total_max', 100)
    rows = []
    for r in ms.get('rows', []):
        total = r.get('total', 0)
        pct = round(total / total_max * 100, 1) if total_max else 0
        scheme = ms.get('grade_scheme') or []
        grade_row = next((item for item in scheme if item.get('from') is not None and item.get('to') is not None and float(item.get('from')) <= pct <= float(item.get('to'))), None)
        grade = grade_row.get('grade') if grade_row else None
        grade_point = grade_row.get('point') if grade_row else None
        result = grade_row.get('result') if grade_row and grade_row.get('result') else ('Pass' if pct >= ((float(ms.get('passing_marks', 40)) / total_max * 100) if total_max else 40) else 'Fail')
        rows.append({'roll': r.get('roll', ''), 'name': r.get('name', ''), 'total': total,
                     'percent': pct, 'grade': grade or grade_for(pct), 'grade_point': grade_point if grade_point is not None else '—', 'result': result})
    rows.sort(key=lambda x: (-x['total'], x['name'].lower()))
    for i, r in enumerate(rows):
        r['rank'] = i + 1
    pcts = [r['percent'] for r in rows] or [0]
    passing_percent = (float(ms.get('passing_marks', 40)) / total_max * 100) if total_max else 40
    passed = len([p for p in pcts if p >= passing_percent])
    return {
        'available_groups': unique_groups, 'selected': True,
        'exam_title': ms.get('exam_title', ''), 'class': f"{ms.get('class_name','')} - {ms.get('section','')}",
        'subject': ms.get('subject', ''), 'total_max': total_max, 'rows': rows,
        'class_average': round(sum(pcts) / len(pcts), 1), 'highest': max(pcts),
        'pass_rate': round(passed / len(pcts) * 100), 'students': len(rows),
        'top_scorer': rows[0] if rows else None,
    }

@api_router.get("/report-card/{sid}")
async def report_card(sid: str, role: str = Depends(get_current)):
    student = await db.students.find_one({'id': sid})
    if not student:
        raise HTTPException(status_code=404, detail='Student not found.')
    student = clean(student)
    class_name, section = student.get('class_name', ''), student.get('section', '')
    mark_sets = await db.marks_sets.find({'class_name': class_name, 'section': section}).sort('created', 1).to_list(5000)
    marks, class_scores = [], {}
    for mark_set in mark_sets:
        total_max = float(mark_set.get('total_max') or (mark_set.get('max_written', 0) + mark_set.get('max_practical', 0)) or 100)
        scheme = mark_set.get('grade_scheme') or []
        passing_percent = (float(mark_set.get('passing_marks', 40)) / total_max * 100) if total_max else 40
        for row in mark_set.get('rows', []):
            row_student_id = row.get('student_id')
            total = float(row.get('total') or 0)
            percent = round(total / total_max * 100, 1) if total_max else 0
            if row_student_id:
                class_scores.setdefault(row_student_id, []).append(percent)
            if row_student_id != sid:
                continue
            grade_row = next((item for item in scheme if item.get('from') is not None and item.get('to') is not None and float(item.get('from')) <= percent <= float(item.get('to'))), None)
            result = grade_row.get('result') if grade_row and grade_row.get('result') else ('Pass' if percent >= passing_percent else 'Fail')
            marks.append({
                'assessment': mark_set.get('exam_title', 'Exam'), 'subject': mark_set.get('subject', 'Subject'),
                'score': total, 'total_max': total_max, 'percent': percent,
                'grade': grade_row.get('grade') if grade_row else grade_for(percent),
                'grade_point': grade_row.get('point') if grade_row and grade_row.get('point') is not None else '—',
                'result': result, 'created': mark_set.get('created', ''),
            })

    student_average = round(sum(item['percent'] for item in marks) / len(marks), 1) if marks else 0
    class_averages = sorted(
        [{'student_id': student_id, 'average': sum(scores) / len(scores)} for student_id, scores in class_scores.items()],
        key=lambda item: -item['average']
    )
    rank = next((index + 1 for index, item in enumerate(class_averages) if item['student_id'] == sid), None)
    attendance_records = await db.attendance_records.find({'attendance_role': 'student', 'entity_id': sid}).to_list(5000)
    attendance_total = len(attendance_records)
    attendance_present = len([item for item in attendance_records if item.get('status') in {'Present', 'Late'}])
    attendance_percent = round(attendance_present / attendance_total * 100, 1) if attendance_total else None
    overall_result = 'Awaiting marks' if not marks else ('Pass' if all(item['result'] == 'Pass' for item in marks) else 'Needs attention')
    return {
        'student': {
            'id': student.get('id'), 'name': student.get('name', ''), 'roll': student.get('roll') or student.get('admission_no') or '—',
            'admission_no': student.get('admission_no', ''), 'class_name': class_name, 'section': section,
        },
        'marks': marks, 'summary': {
            'average_percent': student_average, 'assessments': len(marks), 'result': overall_result,
            'attendance_percent': attendance_percent, 'class_rank': rank, 'class_size': len(class_averages),
        },
    }

# ---------------- Notifications ----------------
@api_router.get("/notifications")
async def notifications(role: str = Depends(get_current)):
    events = await db.events.find().sort('created', -1).to_list(50)
    out = []
    def ago(iso):
        try:
            dt = datetime.fromisoformat(iso)
            secs = (datetime.utcnow() - dt).total_seconds()
            if secs < 3600: return f"{int(secs//60)} min ago"
            if secs < 86400: return f"{int(secs//3600)} hour(s) ago"
            return f"{int(secs//86400)} day(s) ago"
        except Exception:
            return 'recently'
    for e in events:
        out.append({'title': e['title'], 'body': e['body'], 'time': ago(e.get('created', '')),
                    'type': e.get('type', 'info'), 'unread': e.get('unread', False)})
    # derived overdue fee alerts
    overdue = await db.fees.find({'status': 'Overdue'}).to_list(100)
    if overdue:
        names = ', '.join([o['name'] for o in overdue[:3]])
        out.insert(0, {'title': 'Fee payment overdue', 'body': f"{len(overdue)} students have overdue dues ({names}...).",
                       'time': 'live', 'type': 'warning', 'unread': True})
    return out

@api_router.post("/notifications/read-all")
async def read_all(role: str = Depends(get_current)):
    await db.events.update_many({}, {'$set': {'unread': False}})
    return {'ok': True}

# ---------------- Bulk upload ----------------
CSV_HEADERS = ['student_name', 'Student_Class', 'Student_Section', 'Admission Number', 'birthday', 'sex',
               'aadhar_number', 'caste', 'subcaste', 'phone', 'parent_id', 'mother_name', 'guardian',
               'address', 'password', 'Parent Name', 'Parent Phone', 'Address']
SAMPLE_ROW = ['K.Tapasvi', 'VIII', 'A', '123', '12/6/2005', 'Female', '24543657', 'Hindu', 'OC',
              '9876345908', 'K.Manasvi', '', 'J.Raghu', 'Himyathnagar, Hyderabad', '', 'K. Srikar',
              '9876345908', 'Himyathnagar, Hyderabad']

@api_router.get("/students-template")
async def students_template(class_name: str = '', section: str = '', academic_year: str = '', role: str = Depends(get_current)):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(CSV_HEADERS)
    row = list(SAMPLE_ROW)
    if class_name: row[1] = class_name
    if section: row[2] = section
    w.writerow(row)
    return PlainTextResponse(buf.getvalue(), media_type='text/csv',
                             headers={'Content-Disposition': 'attachment; filename=students_template.csv'})

@api_router.post("/students/bulk")
async def bulk_upload(file: UploadFile = File(...), class_name: str = '', section: str = '', academic_year: str = '', role: str = Depends(get_current)):
    content = (await file.read()).decode('utf-8', errors='ignore')
    reader = csv.DictReader(io.StringIO(content))
    inserted, errors = 0, []
    structure = await db.academic_structure.find_one({'id': 'school-structure'})
    allowed = {(item.get('name'), item_section.get('name')) for item in (structure or {}).get('classes', []) for item_section in item.get('sections', [])}
    for i, row in enumerate(reader, start=2):
        name = (row.get('student_name') or '').strip()
        cls = (row.get('Student_Class') or '').strip()
        sec = (row.get('Student_Section') or '').strip()
        adm = (row.get('Admission Number') or '').strip()
        pid = (row.get('parent_id') or '').strip()
        pname = (row.get('Parent Name') or '').strip()
        pphone = (row.get('Parent Phone') or '').strip()
        if not name or not cls or not sec or not adm or not pname or not pphone:
            errors.append({'row': i, 'error': 'Missing mandatory field(s)'})
            continue
        if class_name and (cls != class_name or sec != section):
            errors.append({'row': i, 'error': f'CSV row must use {class_name} - {section}'})
            continue
        if allowed and (cls, sec) not in allowed:
            errors.append({'row': i, 'error': f'{cls} - {sec} is not configured in Academic Setup'})
            continue
        if await db.students.find_one({'admission_no': adm}):
            errors.append({'row': i, 'error': f'Duplicate admission number {adm}'})
            continue
        s = Student(
            name=name, class_name=cls, section=sec, academic_year=academic_year or (structure or {}).get('academic_year', '2024-2025'), admission_no=adm,
            dob=(row.get('birthday') or '').strip(), gender=(row.get('sex') or '').strip(),
            aadhar=(row.get('aadhar_number') or '').strip(), caste=(row.get('caste') or '').strip(),
            subcaste=(row.get('subcaste') or '').strip(), phone=(row.get('phone') or '').strip(),
            mobile=(row.get('phone') or '').strip(), parent_id=pid,
            mother_name=(row.get('mother_name') or '').strip(), guardian=(row.get('guardian') or '').strip(),
            guardian_name=(row.get('guardian') or '').strip(),
            address=(row.get('address') or row.get('Address') or '').strip(),
            father_name=pname, parent_name=pname, parent_phone=pphone,
        )
        doc = s.dict()
        await db.students.insert_one(dict(doc))
        await apply_active_fee_structures(doc)
        inserted += 1
    if inserted:
        await add_event('success', 'Bulk students imported', f"{inserted} students were added via CSV upload.")
    return {'inserted': inserted, 'errors': errors}

# ---------------- Role dashboards ----------------
@api_router.get("/analytics/fee")
async def analytics_fee(role: str = Depends(get_current)):
    fees = await db.fees.find().to_list(1000)
    collected = sum(f.get('paid', 0) for f in fees)
    pending = sum(f.get('due', 0) for f in fees)
    total = sum(f.get('total', 0) for f in fees)
    top = sorted([f for f in fees if f.get('due', 0) > 0], key=lambda x: -x.get('due', 0))[:5]
    return {
        'stats': {'collected': collected, 'pending': pending, 'total': total, 'invoices': len(fees)},
        'method_split': [],
        'monthly': [],
        'top_dues': [{'name': f.get('name'), 'due': f.get('due'), 'avatar': f.get('avatar', '')} for f in top],
    }

@api_router.get("/analytics/academic")
async def analytics_academic(role: str = Depends(get_current)):
    students = await db.students.find().to_list(1000)
    res = await results(role)
    ai = await analytics_ai(role)
    return {
        'stats': {'pass_rate': res.get('pass_rate', 0), 'avg': res.get('class_average', 0),
                  'attendance': None, 'students': len(students)},
        'attendance_trend': [],
        'subject_scores': ai['subject_scores'],
        'results_top': res.get('rows', [])[:5],
    }

# ---------------- Seeding ----------------
SEED_STUDENTS = [
    {'id': 'EP-2024-0812', 'name': 'Marcus Thorne', 'class_name': 'Grade 11', 'section': 'Section B', 'roll': '042', 'status': 'Active', 'balance': 11450, 'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces'},
    {'id': 'ADM-2024-0892', 'name': 'Aarav Sharma', 'class_name': 'Class 10', 'section': 'Section B', 'roll': '018', 'status': 'Active', 'balance': 0, 'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces'},
    {'id': 'EP-2024-0455', 'name': 'Sophia Martinez', 'class_name': 'Grade 10', 'section': 'Section A', 'roll': '021', 'status': 'Active', 'balance': 18000, 'avatar': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'},
    {'id': 'EP-2024-0311', 'name': 'Elara Vance', 'class_name': 'Grade 10', 'section': 'Section A', 'roll': '009', 'status': 'Active', 'balance': 0, 'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'},
    {'id': 'EP-2024-0790', 'name': 'Benjamin Thorne', 'class_name': 'Grade 10', 'section': 'Section A', 'roll': '012', 'status': 'Inactive', 'balance': 20000, 'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'},
]
SEED_FEES = [
    {'id': 'F1', 'student_id': 'EP-2024-0812', 'name': 'Marcus Thorne', 'total': 45000, 'paid': 33550, 'due': 11450, 'status': 'Partial', 'avatar': SEED_STUDENTS[0]['avatar']},
    {'id': 'F2', 'student_id': 'ADM-2024-0892', 'name': 'Aarav Sharma', 'total': 42000, 'paid': 42000, 'due': 0, 'status': 'Paid', 'avatar': SEED_STUDENTS[1]['avatar']},
    {'id': 'F3', 'student_id': 'EP-2024-0455', 'name': 'Sophia Martinez', 'total': 48000, 'paid': 30000, 'due': 18000, 'status': 'Overdue', 'avatar': SEED_STUDENTS[2]['avatar']},
    {'id': 'F4', 'student_id': 'EP-2024-0311', 'name': 'Elara Vance', 'total': 45000, 'paid': 45000, 'due': 0, 'status': 'Paid', 'avatar': SEED_STUDENTS[3]['avatar']},
    {'id': 'F5', 'student_id': 'EP-2024-0790', 'name': 'Benjamin Thorne', 'total': 40000, 'paid': 20000, 'due': 20000, 'status': 'Overdue', 'avatar': SEED_STUDENTS[4]['avatar']},
]
SEED_EXAMS = [
    {'id': 'X1', 'title': 'Mid-Term 2025', 'class_name': 'Grade 10-A', 'subject': 'Mathematics', 'date': 'Aug 12, 2025', 'room': 'Hall B2', 'status': 'Scheduled'},
    {'id': 'X2', 'title': 'Unit Test 3', 'class_name': 'Grade 9-B', 'subject': 'Science', 'date': 'Aug 18, 2025', 'room': 'Room 204', 'status': 'Scheduled'},
    {'id': 'X3', 'title': 'First Semester Final', 'class_name': 'Grade 11-B', 'subject': 'Physics', 'date': 'Sep 02, 2025', 'room': 'Auditorium', 'status': 'Draft'},
    {'id': 'X4', 'title': 'Weekly Quiz', 'class_name': 'Grade 8-A', 'subject': 'English', 'date': 'Aug 08, 2025', 'room': 'Room 101', 'status': 'Completed'},
]
SEED_LEAVES = [
    {'id': 'L1', 'name': 'Cody Fisher', 'leave_type': 'Medical', 'from_date': '01 Oct 2025', 'to_date': '03 Oct 2025', 'days': 3, 'status': 'Approved', 'avatar': 'https://i.pravatar.cc/80?img=12'},
    {'id': 'L2', 'name': 'Esther Howard', 'leave_type': 'Casual', 'from_date': '28 Sep 2025', 'to_date': '28 Sep 2025', 'days': 1, 'status': 'Rejected', 'avatar': 'https://i.pravatar.cc/80?img=45'},
    {'id': 'L3', 'name': 'Jenny Wilson', 'leave_type': 'Maternity', 'from_date': '15 Aug 2025', 'to_date': '15 Nov 2025', 'days': 92, 'status': 'Approved', 'avatar': 'https://i.pravatar.cc/80?img=32'},
    {'id': 'L4', 'name': 'Guy Hawkins', 'leave_type': 'Annual', 'from_date': '10 Sep 2025', 'to_date': '15 Sep 2025', 'days': 6, 'status': 'Pending', 'avatar': 'https://i.pravatar.cc/80?img=15'},
    {'id': 'L5', 'name': 'Marvin McKinney', 'leave_type': 'Sick', 'from_date': '05 Sep 2025', 'to_date': '07 Sep 2025', 'days': 3, 'status': 'Approved', 'avatar': 'https://i.pravatar.cc/80?img=13'},
    {'id': 'L6', 'name': 'Bessie Cooper', 'leave_type': 'Casual', 'from_date': '01 Sep 2025', 'to_date': '01 Sep 2025', 'days': 1, 'status': 'Rejected', 'avatar': 'https://i.pravatar.cc/80?img=47'},
]
SEED_TEACHERS = [
    {'id': 'TCH-001', 'name': 'Dr. Anita Rao', 'subject': 'Physics', 'classes': 'Grade 11, 12', 'phone': '+91 98765 10001', 'status': 'Active', 'avatar': 'https://i.pravatar.cc/80?img=32'},
    {'id': 'TCH-002', 'name': 'Vikram Nair', 'subject': 'Mathematics', 'classes': 'Grade 9, 10', 'phone': '+91 98765 10002', 'status': 'Active', 'avatar': 'https://i.pravatar.cc/80?img=12'},
    {'id': 'TCH-003', 'name': 'Sneha Kapoor', 'subject': 'English', 'classes': 'Grade 6, 7, 8', 'phone': '+91 98765 10003', 'status': 'On Leave', 'avatar': 'https://i.pravatar.cc/80?img=45'},
    {'id': 'TCH-004', 'name': 'Rahul Menon', 'subject': 'Chemistry', 'classes': 'Grade 11', 'phone': '+91 98765 10004', 'status': 'Active', 'avatar': 'https://i.pravatar.cc/80?img=15'},
    {'id': 'TCH-005', 'name': 'Priya Das', 'subject': 'Biology', 'classes': 'Grade 10, 12', 'phone': '+91 98765 10005', 'status': 'Active', 'avatar': 'https://i.pravatar.cc/80?img=47'},
    {'id': 'TCH-006', 'name': 'Arjun Sethi', 'subject': 'Computer Science', 'classes': 'Grade 8, 9', 'phone': '+91 98765 10006', 'status': 'Active', 'avatar': 'https://i.pravatar.cc/80?img=13'},
]

async def seed():
    # Never retain the legacy demonstration exams in the real examination register.
    await db.exams.delete_many({'id': {'$in': [item['id'] for item in SEED_EXAMS]}})
    # Do not retain sample leave records once real school records are being used.
    await db.leaves.delete_many({'id': {'$in': [item['id'] for item in SEED_LEAVES]}})
    # Once a school chooses to remove demo data, never recreate it on restart.
    state = await db.system_state.find_one({'id': 'demo-data-state'})
    if state and state.get('demo_data_removed'):
        logger.info('Demo data seeding is disabled for this school')
        return
    seeds = [
        ('students', SEED_STUDENTS), ('fees', SEED_FEES), ('teachers', SEED_TEACHERS),
    ]
    for coll, data in seeds:
        count = await db[coll].count_documents({})
        if count == 0:
            await db[coll].insert_many([dict(x) for x in data])
            logger.info(f"Seeded {coll} with {len(data)} docs")
    if await db.marks_sets.count_documents({}) == 0:
        await db.marks_sets.insert_one({
            'id': 'MS1', 'exam_title': 'Mid-Term 2025', 'class_name': 'Grade 10', 'section': 'Section A',
            'subject': 'Mathematics', 'max_written': 70, 'max_practical': 30, 'total_max': 100,
            'created': datetime.utcnow().isoformat(),
            'rows': [
                {'roll': '#102401', 'name': 'Benjamin Thorne', 'written': 62, 'practical': 28, 'total': 90},
                {'roll': '#102402', 'name': 'Sophia Martinez', 'written': 55, 'practical': 24, 'total': 79},
                {'roll': '#102403', 'name': 'Elara Vance', 'written': 68, 'practical': 29, 'total': 97},
                {'roll': '#102404', 'name': 'Marcus Thorne', 'written': 60, 'practical': 22, 'total': 82},
                {'roll': '#102405', 'name': 'Aarav Sharma', 'written': 58, 'practical': 25, 'total': 83},
            ],
        })
        logger.info("Seeded marks_sets")
    if await db.events.count_documents({}) == 0:
        base = datetime.utcnow()
        evs = [
            {'type': 'info', 'title': 'Exam scheduled', 'body': 'Mid-Term 2025 for Grade 10-A on Aug 12.', 'mins': 180},
            {'type': 'info', 'title': 'New transport route', 'body': 'Route added for Sector 9 pickups.', 'mins': 1440},
            {'type': 'success', 'title': 'Fees reconciled', 'body': 'July fee collection reconciled successfully.', 'mins': 2880},
        ]
        for e in evs:
            await db.events.insert_one({'id': str(uuid.uuid4()), 'type': e['type'], 'title': e['title'],
                                        'body': e['body'], 'unread': False,
                                        'created': (base - timedelta(minutes=e['mins'])).isoformat()})
        logger.info("Seeded events")

@app.on_event("startup")
async def startup():
    await seed()

@api_router.get("/")
async def root():
    return {"message": "Orison API"}

# School academic structure: academic year -> classes -> sections -> subjects.
@api_router.get("/academic-structure")
async def get_academic_structure(role: str = Depends(get_current)):
    structure = await db.academic_structure.find_one({'id': 'school-structure'})
    if not structure:
        return {'academic_year': '', 'classes': []}
    return clean(structure)

@api_router.put("/academic-structure")
async def save_academic_structure(payload: dict, role: str = Depends(get_current)):
    academic_year = str(payload.get('academic_year') or '').strip()
    classes = payload.get('classes') or []
    if not academic_year:
        raise HTTPException(status_code=422, detail='Academic year is required.')
    existing = await db.academic_structure.find_one({'id': 'school-structure'})
    if existing and existing.get('academic_year') and existing.get('academic_year') != academic_year:
        raise HTTPException(status_code=409, detail='The Academic Year is locked after setup. Submit a change request for Principal or Director approval.')
    sanitized = []
    for item in classes:
        name = str(item.get('name') or '').strip()
        if not name:
            continue
        sections = []
        for section in item.get('sections') or []:
            section_name = str(section.get('name') or '').strip()
            if section_name:
                sections.append({'name': section_name, 'subjects': [str(x).strip() for x in section.get('subjects') or [] if str(x).strip()]})
        sanitized.append({'id': item.get('id') or str(uuid.uuid4()), 'name': name, 'sections': sections})
    document = {'id': 'school-structure', 'academic_year': academic_year, 'classes': sanitized, 'updated': datetime.utcnow().isoformat()}
    await db.academic_structure.update_one({'id': 'school-structure'}, {'$set': document}, upsert=True)
    return document

@api_router.get("/academic-year-change-request")
async def get_academic_year_change_request(role: str = Depends(get_current)):
    request = await db.academic_year_change_requests.find_one({'status': 'Pending'}, sort=[('created', -1)])
    if not request:
        return None
    response = clean(request)
    # The one-time code is deliberately visible only to the approving authority.
    if role not in ('principal', 'director'):
        response.pop('otp', None)
    return response

@api_router.post("/academic-year-change-request")
async def request_academic_year_change(payload: dict, role: str = Depends(get_current)):
    if role != 'admin':
        raise HTTPException(status_code=403, detail='Only an Admin can request an Academic Year change.')
    next_year = str(payload.get('academic_year') or '').strip()
    structure = await db.academic_structure.find_one({'id': 'school-structure'})
    current_year = (structure or {}).get('academic_year', '')
    if not current_year:
        raise HTTPException(status_code=422, detail='Set the first Academic Year before requesting a change.')
    if not next_year or next_year == current_year:
        raise HTTPException(status_code=422, detail='Enter a different Academic Year to request a change.')
    await db.academic_year_change_requests.update_many({'status': 'Pending'}, {'$set': {'status': 'Superseded'}})
    request = {
        'id': str(uuid.uuid4()), 'current_year': current_year, 'requested_year': next_year,
        'status': 'Pending', 'otp': f"{secrets.randbelow(1000000):06d}",
        'recipients': ['Principal', 'Director'], 'requested_by': 'Admin',
        'created': datetime.utcnow().isoformat(), 'expires_at': (datetime.utcnow() + timedelta(minutes=30)).isoformat(),
    }
    await db.academic_year_change_requests.insert_one(dict(request))
    await add_event('warning', 'Academic Year change approval required', f"Admin requested a change from {current_year} to {next_year}. Approval code has been sent to Principal and Director.")
    return {'id': request['id'], 'current_year': current_year, 'requested_year': next_year, 'status': 'Pending', 'recipients': request['recipients']}

@api_router.post("/academic-year-change-request/{request_id}/confirm")
async def confirm_academic_year_change(request_id: str, payload: dict, role: str = Depends(get_current)):
    if role != 'admin':
        raise HTTPException(status_code=403, detail='Only the Admin can confirm this change using the Principal or Director OTP.')
    request = await db.academic_year_change_requests.find_one({'id': request_id, 'status': 'Pending'})
    if not request:
        raise HTTPException(status_code=404, detail='No pending Academic Year change request was found.')
    if datetime.fromisoformat(request['expires_at']) < datetime.utcnow():
        await db.academic_year_change_requests.update_one({'id': request_id}, {'$set': {'status': 'Expired'}})
        raise HTTPException(status_code=422, detail='This approval code has expired. Ask the Admin to request a new one.')
    if str(payload.get('otp') or '').strip() != request.get('otp'):
        raise HTTPException(status_code=422, detail='The approval code is incorrect.')
    await db.academic_structure.update_one({'id': 'school-structure'}, {'$set': {'academic_year': request['requested_year'], 'updated': datetime.utcnow().isoformat()}})
    await db.academic_year_change_requests.update_one({'id': request_id}, {'$set': {'status': 'Approved', 'confirmed_by': 'Admin', 'confirmed_at': datetime.utcnow().isoformat()}})
    await add_event('success', 'Academic Year changed', f"Admin confirmed the Academic Year change from {request['current_year']} to {request['requested_year']} using the Principal/Director OTP.")
    return {'ok': True, 'academic_year': request['requested_year']}

# Admissions CRM and collection intelligence
@api_router.get("/admission-leads")
async def list_admission_leads(role: str = Depends(get_current)):
    return [clean(x) for x in await db.admission_leads.find().sort('created', -1).to_list(1000)]

@api_router.post("/admission-leads")
async def create_admission_lead(payload: dict, role: str = Depends(get_current)):
    now = datetime.utcnow()
    payload.setdefault('id', str(uuid.uuid4())); payload.setdefault('stage', 'Enquiry'); payload.setdefault('created', now.isoformat()); payload.setdefault('last_activity', now.isoformat())
    payload['followups'] = [{'day': 0, 'task': 'Call parent', 'status': 'Pending'}, {'day': 1, 'task': 'Send information', 'status': 'Pending'}, {'day': 3, 'task': 'Follow-up call', 'status': 'Pending'}, {'day': 7, 'task': 'Campus visit reminder', 'status': 'Pending'}, {'day': 14, 'task': 'Final follow-up', 'status': 'Pending'}]
    await db.admission_leads.insert_one(dict(payload)); return payload

@api_router.get("/admissions-intelligence")
async def admissions_intelligence(role: str = Depends(get_current)):
    leads = [clean(x) for x in await db.admission_leads.find().to_list(1000)]
    stages = ['Enquiry', 'Contacted', 'Visit', 'Application', 'Selected', 'Admitted']
    funnel = [{'stage': stage, 'count': len([x for x in leads if x.get('stage') == stage])} for stage in stages]
    stale = []
    for lead in leads:
        try:
            if datetime.utcnow() - datetime.fromisoformat(lead.get('last_activity', lead['created'])) > timedelta(hours=48): stale.append(lead)
        except ValueError: pass
    reasons = {}
    for lead in leads:
        if lead.get('stage') == 'Lost' and lead.get('lost_reason'): reasons[lead['lost_reason']] = reasons.get(lead['lost_reason'], 0) + 1
    return {'funnel': funnel, 'stale': stale, 'lost_reasons': [{'reason': k, 'count': v} for k, v in reasons.items()], 'conversion': round((funnel[-1]['count'] / funnel[0]['count'] * 100), 1) if funnel[0]['count'] else 0}

@api_router.get("/collections-intelligence")
async def collections_intelligence(role: str = Depends(get_current)):
    raw_fees = await db.fees.find().to_list(5000)
    fees = [await fee_with_student(item) for item in raw_fees]
    followups = {
        item.get('fee_id'): clean(item)
        for item in await db.collection_followups.find().to_list(5000)
    }
    today_date = datetime.utcnow().date()
    bucket_config = [
        ('Critical', 'More than 60 days overdue', 'Principal / KDM escalation'),
        ('High Priority', '30–60 days overdue', 'Fee manager follow-up'),
        ('Upcoming', 'Due within 15 days', 'Send payment reminder'),
        ('Current Dues', 'Other active dues', 'Monitor payment status'),
    ]
    buckets = {name: {'label': name, 'rule': rule, 'default_action': action, 'amount': 0, 'count': 0} for name, rule, action in bucket_config}
    cases = []
    promises_due_today = 0
    missed_followups = 0

    for fee in fees:
        due = float(fee.get('due') or 0)
        if due <= 0:
            continue
        due_date = None
        try:
            due_date = datetime.fromisoformat(str(fee.get('due_date') or '')).date()
        except ValueError:
            pass
        days_overdue = max(0, (today_date - due_date).days) if due_date and due_date < today_date else 0
        days_until_due = (due_date - today_date).days if due_date and due_date >= today_date else None
        if days_overdue > 60:
            bucket = 'Critical'
        elif days_overdue >= 30:
            bucket = 'High Priority'
        elif days_until_due is not None and days_until_due <= 15:
            bucket = 'Upcoming'
        else:
            bucket = 'Current Dues'

        followup = followups.get(fee.get('id'), {})
        next_follow_up = str(followup.get('next_follow_up') or '')
        promise_date = str(followup.get('promise_date') or '')
        case_status = followup.get('case_status') or 'Open'
        if promise_date == today_date.isoformat() and case_status not in {'Closed', 'Paid'}:
            promises_due_today += 1
        if next_follow_up and next_follow_up < today_date.isoformat() and case_status not in {'Closed', 'Paid'}:
            missed_followups += 1
        buckets[bucket]['amount'] += due
        buckets[bucket]['count'] += 1
        cases.append({
            'id': fee.get('id'),
            'fee_id': fee.get('id'),
            'student_id': fee.get('student_id', ''),
            'student_name': fee.get('name', ''),
            'admission_no': fee.get('admission_no', ''),
            'parent_name': fee.get('parent_name', ''),
            'parent_phone': fee.get('parent_phone', ''),
            'class_name': fee.get('class_name', ''),
            'section': fee.get('section', ''),
            'fee_name': fee.get('fee_name', 'School Fee'),
            'due': due,
            'due_date': fee.get('due_date', ''),
            'days_overdue': days_overdue,
            'bucket': bucket,
            'status': fee.get('status', 'Unpaid'),
            'owner': followup.get('owner') or 'Unassigned',
            'last_contact': followup.get('last_contact') or '',
            'parent_response': followup.get('parent_response') or '',
            'next_follow_up': next_follow_up,
            'promise_amount': float(followup.get('promise_amount') or 0),
            'promise_date': promise_date,
            'case_status': case_status,
            'default_action': buckets[bucket]['default_action'],
        })

    cases.sort(key=lambda item: ({'Critical': 0, 'High Priority': 1, 'Upcoming': 2, 'Current Dues': 3}[item['bucket']], -item['due']))
    expected = sum(float(item.get('total') or 0) for item in fees)
    discounts = sum(float(item.get('discount') or 0) for item in fees)
    collected = sum(float(item.get('paid') or 0) for item in fees)
    outstanding = sum(float(item.get('due') or 0) for item in fees)
    fee_breakdown = {}
    for fee in fees:
        fee_name = str(fee.get('fee_name') or fee.get('category') or 'Uncategorised Fee').strip()
        item = fee_breakdown.setdefault(fee_name, {
            'fee_name': fee_name, 'category': str(fee.get('category') or '').strip(),
            'expected': 0, 'discounts': 0, 'collected': 0, 'outstanding': 0, 'fee_dues': 0,
        })
        item['expected'] += float(fee.get('total') or 0)
        item['discounts'] += float(fee.get('discount') or 0)
        item['collected'] += float(fee.get('paid') or 0)
        item['outstanding'] += float(fee.get('due') or 0)
        if float(fee.get('due') or 0) > 0:
            item['fee_dues'] += 1
    fee_breakdown_rows = []
    for item in fee_breakdown.values():
        collectible = max(0, item['expected'] - item['discounts'])
        item['collection_rate'] = round((item['collected'] / max(1, collectible)) * 100, 1)
        for key in ('expected', 'discounts', 'collected', 'outstanding'):
            item[key] = round(item[key], 2)
        fee_breakdown_rows.append(item)
    fee_breakdown_rows.sort(key=lambda item: (-item['outstanding'], item['fee_name'].lower()))
    return {
        'expected': expected,
        'approved_adjustments': discounts,
        'collectible': max(0, expected - discounts),
        'collected': collected,
        'outstanding': outstanding,
        'efficiency': round((collected / max(1, expected - discounts)) * 100, 1),
        'buckets': list(buckets.values()),
        'fee_breakdown': fee_breakdown_rows,
        'cases': cases,
        'accounts': cases,
        'today': {'promises_due': promises_due_today, 'missed_followups': missed_followups, 'critical': buckets['Critical']['count']},
        'reconciliation': {'expected': expected, 'adjustments': discounts, 'collectible': max(0, expected - discounts), 'collected': collected, 'outstanding': outstanding},
    }

@api_router.post("/collections-intelligence/{fee_id}/follow-up")
async def save_collection_follow_up(fee_id: str, payload: dict, role: str = Depends(get_current)):
    fee = await db.fees.find_one({'id': fee_id})
    if not fee:
        raise HTTPException(status_code=404, detail='Fee account not found.')
    allowed = {'owner', 'last_contact', 'parent_response', 'next_follow_up', 'promise_amount', 'promise_date', 'case_status'}
    update = {key: payload.get(key) for key in allowed if key in payload}
    update['fee_id'] = fee_id
    update['updated_at'] = datetime.utcnow().isoformat()
    update['updated_by'] = ROLE_CONFIG[role]['name']
    await db.collection_followups.update_one({'fee_id': fee_id}, {'$set': update, '$setOnInsert': {'id': f'COL-{uuid.uuid4().hex[:10].upper()}', 'created_at': datetime.utcnow().isoformat()}}, upsert=True)
    await add_event('info', 'Collection follow-up updated', f"{ROLE_CONFIG[role]['name']} updated the collection follow-up for {fee.get('name', 'a student')}.")
    return clean(await db.collection_followups.find_one({'fee_id': fee_id}))

# Academic improvement engine: data -> risk -> action -> result
async def detect_academic_risks(create_cases: bool = False):
    """Evaluate saved marks and operational signals, optionally opening deduplicated cases."""
    students = [clean(x) for x in await db.students.find().to_list(1000)]
    signals = {x['student_id']: clean(x) for x in await db.academic_signals.find().to_list(1000)}
    marks_sets = await db.marks_sets.find().sort('created', 1).to_list(1000)
    histories = {}
    for mark_set in marks_sets:
        maximum = mark_set.get('total_max') or 100
        subject = mark_set.get('subject') or 'Subject'
        for row in mark_set.get('rows', []):
            name = (row.get('name') or '').strip().lower()
            if name and maximum:
                histories.setdefault(name, {}).setdefault(subject, []).append(round((row.get('total', 0) / maximum) * 100, 1))
    risks, created, existing = [], 0, 0
    for student in students:
        signal = signals.get(student['id'], {})
        attendance, homework = signal.get('attendance_percent', 100), signal.get('homework_percent', 100)
        issues, low_subjects = [], []
        if attendance < 75: issues.append(f"Attendance {attendance}%")
        if homework < 60: issues.append(f"Homework {homework}%")
        for subject, scores in histories.get(student['name'].lower(), {}).items():
            latest = scores[-1]
            if latest < 50:
                issues.append(f"{subject} score {latest}%"); low_subjects.append(subject)
            if len(scores) > 1 and latest - scores[-2] <= -10:
                issues.append(f"{subject} declined {abs(round(latest - scores[-2], 1))} points"); low_subjects.append(subject)
        if not issues:
            continue
        severity = 'High' if attendance < 65 or any('score ' in item and float(item.rsplit(' ', 1)[-1].strip('%')) < 40 for item in issues if 'score ' in item) or len(issues) >= 3 else 'Medium'
        concern = '; '.join(issues)
        risk = {'student_id': student['id'], 'student_name': student['name'], 'class_name': f"{student.get('class_name','')} {student.get('section','')}".strip(), 'indicators': issues, 'severity': severity, 'recommendation': 'Parent meeting, targeted practice, and reassessment' if severity == 'High' else 'Teacher follow-up and reassessment'}
        risks.append(risk)
        if create_cases:
            open_case = await db.interventions.find_one({'student_id': student['id'], 'status': {'$ne': 'Completed'}})
            if open_case:
                existing += 1
            else:
                case = {'id': str(uuid.uuid4()), 'student_id': student['id'], 'student_name': student['name'], 'concern': concern, 'recommended_action': risk['recommendation'], 'owner': 'Academic Coordinator', 'deadline': (datetime.utcnow() + timedelta(days=7)).date().isoformat(), 'status': 'Open', 'auto_generated': True, 'created': datetime.utcnow().isoformat()}
                await db.interventions.insert_one(case)
                await add_event('warning', 'Academic intervention created', f"{student['name']} was flagged: {concern}.")
                created += 1
    return {'risks': risks, 'created': created, 'existing': existing}

@api_router.get("/academic-intelligence")
async def academic_intelligence(role: str = Depends(get_current)):
    risks = (await detect_academic_risks())['risks']
    units = [clean(x) for x in await db.curriculum_units.find().to_list(1000)]
    cases = [clean(x) for x in await db.interventions.find().to_list(1000)]
    today = datetime.utcnow().date().isoformat()
    behind = [x for x in units if x.get('status') == 'Overdue' or (x.get('target_date') and x.get('target_date') < today and x.get('status') != 'Completed')]
    open_cases = [x for x in cases if x.get('status') != 'Completed']
    actions = []
    if risks:
        actions.append({'title': f"{len(risks)} students need attention", 'path': '/academics/interventions'})
    for unit in behind:
        teacher = unit.get('teacher_name') or 'Unassigned teacher'
        teaching_group = ' '.join(filter(None, [unit.get('class_name'), unit.get('section'), unit.get('subject')]))
        actions.append({'title': f"{teacher} is behind timeline: {unit.get('chapter')} ({teaching_group})", 'path': '/academics/syllabus'})
    return {'school_academic_score': max(0, 100 - len(risks) * 3 - len(behind) * 3),
            'at_risk_students': len(risks), 'syllabus_behind': len(behind), 'interventions_open': len(open_cases),
            'risks': risks, 'actions': actions, 'syllabus': units}

@api_router.post("/academic-intelligence/run")
async def run_academic_intelligence(role: str = Depends(get_current)):
    return await detect_academic_risks(create_cases=True)

@api_router.get("/academic-signals")
async def list_academic_signals(role: str = Depends(get_current)):
    # Never show orphaned/demo signals: only current enrolled students are eligible.
    student_ids = [x['id'] for x in await db.students.find({}, {'id': 1}).to_list(1000)]
    if not student_ids:
        return []
    return [clean(x) for x in await db.academic_signals.find({'student_id': {'$in': student_ids}}).to_list(1000)]

@api_router.post("/academic-signals")
async def save_academic_signal(payload: dict, role: str = Depends(get_current)):
    student_id = str(payload.get('student_id') or '').strip()
    if not student_id or not await db.students.find_one({'id': student_id}):
        raise HTTPException(status_code=422, detail='Choose a currently enrolled student.')
    for field in ('attendance_percent', 'homework_percent', 'participation_percent'):
        try:
            value = float(payload.get(field))
        except (TypeError, ValueError):
            raise HTTPException(status_code=422, detail='Enter a real percentage for attendance, homework and participation.')
        if value < 0 or value > 100:
            raise HTTPException(status_code=422, detail='Percentages must be between 0 and 100.')
        payload[field] = value
    payload['updated'] = datetime.utcnow().isoformat()
    await db.academic_signals.update_one({'student_id': payload['student_id']}, {'$set': payload}, upsert=True)
    await detect_academic_risks(create_cases=True)
    return payload

@api_router.get("/student-health-dashboard")
async def student_health_dashboard(class_name: str = '', section: str = '', role: str = Depends(get_current)):
    """Real class-section health view. It never invents attendance, activity or assessment scores."""
    query = {}
    if class_name:
        query['class_name'] = class_name
    if section:
        query['section'] = section
    students = [clean(x) for x in await db.students.find(query).sort('name', 1).to_list(1000)]
    student_ids = [student['id'] for student in students]
    signals = {item['student_id']: clean(item) for item in await db.academic_signals.find({'student_id': {'$in': student_ids}}).to_list(1000)} if student_ids else {}
    attendance_history = {}
    if student_ids:
        records = await db.attendance_records.find({'attendance_role': 'student', 'entity_id': {'$in': student_ids}}).to_list(10000)
        for record in records:
            history = attendance_history.setdefault(record['entity_id'], {'total': 0, 'attended': 0})
            history['total'] += 1
            if record.get('status') in ('Present', 'Late'):
                history['attended'] += 1
    mark_sets = await db.marks_sets.find({
        **({'class_name': class_name} if class_name else {}),
        **({'section': section} if section else {}),
    }).sort('created', 1).to_list(1000)

    assessments = {}
    latest_subject_sets = {}
    for mark_set in mark_sets:
        subject = mark_set.get('subject') or 'Subject'
        created = mark_set.get('created') or ''
        if subject not in latest_subject_sets or created >= latest_subject_sets[subject].get('created', ''):
            latest_subject_sets[subject] = mark_set
        key = f"{mark_set.get('exam_title') or 'Assessment'}|{created[:10]}"
        assessments.setdefault(key, {'title': mark_set.get('exam_title') or 'Assessment', 'created': created, 'by_student': {}})
        maximum = mark_set.get('total_max') or (mark_set.get('max_written', 0) + mark_set.get('max_practical', 0)) or 100
        for row in mark_set.get('rows', []):
            name = (row.get('name') or '').strip().lower()
            if not name or not maximum:
                continue
            score = round((float(row.get('total', 0) or 0) / maximum) * 100, 1)
            assessments[key]['by_student'].setdefault(name, []).append(score)

    subject_scores = []
    for subject, mark_set in sorted(latest_subject_sets.items()):
        maximum = mark_set.get('total_max') or (mark_set.get('max_written', 0) + mark_set.get('max_practical', 0)) or 100
        values = [round((float(row.get('total', 0) or 0) / maximum) * 100, 1) for row in mark_set.get('rows', []) if maximum]
        subject_scores.append({'subject': subject, 'average': round(sum(values) / len(values), 1) if values else None, 'assessment': mark_set.get('exam_title') or 'Assessment'})

    ordered_assessments = sorted(assessments.values(), key=lambda item: item.get('created', ''))
    rows = []
    for student in students:
        name = (student.get('name') or '').strip().lower()
        scores = []
        for assessment in ordered_assessments:
            values = assessment['by_student'].get(name, [])
            if values:
                scores.append({'title': assessment['title'], 'score': round(sum(values) / len(values), 1)})
        latest = scores[-1]['score'] if scores else None
        previous = scores[-2]['score'] if len(scores) >= 2 else None
        two_back = scores[-3]['score'] if len(scores) >= 3 else None
        comparison = round(latest - previous, 1) if latest is not None and previous is not None else None
        if latest is None:
            trend_status, trend_message = 'Awaiting data', 'No exam result recorded yet'
        elif comparison is None:
            trend_status, trend_message = 'Baseline recorded', 'One exam recorded — comparison starts after the next exam'
        elif comparison >= 3:
            trend_status, trend_message = 'Improved', f"Improved by {comparison:g} points since the previous exam"
        elif comparison <= -3:
            trend_status, trend_message = 'Declined', f"Declined by {abs(comparison):g} points since the previous exam"
        else:
            trend_status, trend_message = 'Stable', 'Performance is stable compared with the previous exam'
        signal = signals.get(student['id'], {})
        attendance = round((attendance_history[student['id']]['attended'] / attendance_history[student['id']]['total']) * 100, 1) if attendance_history.get(student['id'], {}).get('total') else signal.get('attendance_percent')
        rows.append({
            'student_id': student['id'], 'student_name': student.get('name', ''), 'roll': student.get('roll', ''),
            'attendance_percent': attendance, 'participation_percent': signal.get('participation_percent'),
            'latest_score': latest, 'previous_score': previous, 'two_exams_ago_score': two_back,
            'change_from_previous': comparison,
            'change_from_two_exams': round(latest - two_back, 1) if latest is not None and two_back is not None else None,
            'trend_status': trend_status, 'trend_message': trend_message,
            'assessments_recorded': len(scores),
        })

    attendance_values = [row['attendance_percent'] for row in rows if row['attendance_percent'] is not None]
    participation_values = [row['participation_percent'] for row in rows if row['participation_percent'] is not None]
    latest_values = [row['latest_score'] for row in rows if row['latest_score'] is not None]
    return {
        'class_name': class_name, 'section': section, 'students': rows, 'subject_scores': subject_scores,
        'summary': {
            'student_count': len(rows),
            'overall_performance': round(sum(latest_values) / len(latest_values), 1) if latest_values else None,
            'average_attendance': round(sum(attendance_values) / len(attendance_values), 1) if attendance_values else None,
            'average_participation': round(sum(participation_values) / len(participation_values), 1) if participation_values else None,
            'improving_students': len([row for row in rows if (row['change_from_previous'] or 0) > 0]),
            'needs_attention': len([row for row in rows if (row['latest_score'] is not None and row['latest_score'] < 50) or (row['attendance_percent'] is not None and row['attendance_percent'] < 75)]),
        },
    }

@api_router.get("/curriculum-units")
async def list_curriculum_units(role: str = Depends(get_current)):
    today = datetime.utcnow().date().isoformat()
    units = [clean(x) for x in await db.curriculum_units.find().sort('target_date', 1).to_list(1000)]
    for unit in units:
        if unit.get('status') != 'Completed' and unit.get('target_date') and unit['target_date'] < today:
            unit['status'] = 'Overdue'
            if not unit.get('overdue_alerted'):
                await add_event('warning', 'Syllabus timeline overdue', f"{unit.get('teacher_name', 'Assigned teacher')} has not completed {unit.get('chapter')} for {unit.get('class_name')} {unit.get('section')} by {unit.get('target_date')}. Alerted: Principal, Director and Admin.")
                await db.curriculum_units.update_one({'id': unit['id']}, {'$set': {'status': 'Overdue', 'overdue_alerted': True, 'alert_recipients': ['Principal', 'Director', 'Admin']}})
            else:
                await db.curriculum_units.update_one({'id': unit['id']}, {'$set': {'status': 'Overdue'}})
    return units

@api_router.post("/curriculum-units")
async def save_curriculum_unit(payload: dict, role: str = Depends(get_current)):
    required = ['class_name', 'section', 'subject', 'chapter', 'start_date', 'target_date']
    missing = [key for key in required if not str(payload.get(key) or '').strip()]
    if missing:
        raise HTTPException(status_code=422, detail='Complete class, section, subject, chapter and both timeline dates.')
    structure = await db.academic_structure.find_one({'id': 'school-structure'})
    match = next((item for item in (structure or {}).get('classes', []) if item.get('name') == payload['class_name']), None)
    section = next((item for item in (match or {}).get('sections', []) if item.get('name') == payload['section']), None)
    if not section or payload['subject'] not in section.get('subjects', []):
        raise HTTPException(status_code=422, detail='Choose a subject configured for this class and section in Academic Setup.')
    allocation = await db.teacher_allocations.find_one({'class_name': payload['class_name'], 'section': payload['section'], 'subject': payload['subject']})
    payload.setdefault('id', str(uuid.uuid4()))
    payload['teacher_id'] = (allocation or {}).get('teacher_id', '')
    payload['teacher_name'] = (allocation or {}).get('teacher_name', 'Unassigned — assign a subject teacher')
    payload['completed_progress'] = 0
    payload['status'] = 'Planned'
    payload['created'] = datetime.utcnow().isoformat()
    await db.curriculum_units.insert_one(dict(payload))
    return payload

@api_router.post("/curriculum-units/{unit_id}/complete")
async def complete_curriculum_unit(unit_id: str, role: str = Depends(get_current)):
    unit = await db.curriculum_units.find_one({'id': unit_id})
    if not unit:
        raise HTTPException(status_code=404, detail='Curriculum chapter not found.')
    await db.curriculum_units.update_one({'id': unit_id}, {'$set': {'status': 'Completed', 'completed_progress': 100, 'completed_at': datetime.utcnow().isoformat(), 'overdue_alerted': False}})
    await add_event('success', 'Chapter completed', f"{unit.get('chapter')} was marked complete for {unit.get('class_name')} {unit.get('section')}.")
    return {'ok': True}

@api_router.get("/interventions")
async def list_interventions(role: str = Depends(get_current)):
    return [clean(x) for x in await db.interventions.find().to_list(1000)]

@api_router.post("/interventions")
async def save_intervention(payload: dict, role: str = Depends(get_current)):
    payload.setdefault('id', str(uuid.uuid4())); payload.setdefault('status', 'Open'); payload.setdefault('created', datetime.utcnow().isoformat())
    await db.interventions.insert_one(dict(payload))
    return payload

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware, allow_credentials=True, allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
