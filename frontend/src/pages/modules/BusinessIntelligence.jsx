import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { Badge, Btn, Card, PageTitle, StatCards, Table } from '../../components/Shared';
import api from '../../api';
import { AlertTriangle, IndianRupee, Plus, Users, UserRoundCheck } from 'lucide-react';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const stages = ['Enquiry', 'Contacted', 'Visit', 'Application', 'Selected', 'Admitted', 'Lost'];

export const AdmissionsCRM = () => {
  const [leads, setLeads] = useState([]), [data, setData] = useState({ funnel: [], stale: [], lost_reasons: [] }); const [form, setForm] = useState({ name: '', phone: '', interested_class: '', counsellor: '', stage: 'Enquiry', lost_reason: '' });
  const load = useCallback(async () => { const [l, d] = await Promise.all([api.get('/admission-leads'), api.get('/admissions-intelligence')]); setLeads(l.data); setData(d.data); }, []); useEffect(() => { load().catch(() => {}); }, [load]);
  const save = async () => { if (!form.name || !form.phone) return; await api.post('/admission-leads', form); setForm({ name: '', phone: '', interested_class: '', counsellor: '', stage: 'Enquiry', lost_reason: '' }); load(); };
  return <Layout><PageTitle title="Admissions CRM" subtitle="Track every enquiry through follow-up, visit, application and admission." actions={<Btn icon={Plus} onClick={save}>Add enquiry</Btn>} />
    <StatCards items={[{ label: 'Total enquiries', value: data.funnel[0]?.count || 0, icon: Users }, { label: 'Admissions', value: data.funnel.find((x) => x.stage === 'Admitted')?.count || 0, icon: UserRoundCheck, tint: 'bg-green-50 text-green-600' }, { label: 'Conversion rate', value: `${data.conversion || 0}%`, icon: UserRoundCheck, tint: 'bg-blue-50 text-blue-600' }, { label: 'No activity >48 hrs', value: data.stale.length, icon: AlertTriangle, tint: 'bg-red-50 text-[#C4141B]' }]} />
    <Card title="New enquiry"><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Parent name" className="h-10 border rounded-lg px-3 text-[13px]" /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="h-10 border rounded-lg px-3 text-[13px]" /><input value={form.interested_class} onChange={(e) => setForm({ ...form, interested_class: e.target.value })} placeholder="Interested class" className="h-10 border rounded-lg px-3 text-[13px]" /><input value={form.counsellor} onChange={(e) => setForm({ ...form, counsellor: e.target.value })} placeholder="Counsellor" className="h-10 border rounded-lg px-3 text-[13px]" /><select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="h-10 border rounded-lg px-3 text-[13px]">{stages.map((x) => <option key={x}>{x}</option>)}</select><input value={form.lost_reason} onChange={(e) => setForm({ ...form, lost_reason: e.target.value })} placeholder="Lost reason, if applicable" className="h-10 border rounded-lg px-3 text-[13px]" /></div></Card>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5"><Card title="Admission funnel">{data.funnel.map((x) => <div key={x.stage} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0"><span className="text-[13px]">{x.stage}</span><span className="font-semibold text-[13px]">{x.count}</span></div>)}</Card><Card title="Leads needing follow-up"><div className="text-[13px] text-[#666]">{data.stale.length ? `${data.stale.length} enquiries have had no follow-up activity for 48 hours.` : 'All enquiries have recent activity.'}</div></Card></div>
    <Card title="Enquiry pipeline" className="mt-5" pad="p-0"><Table columns={[{ label: 'Parent' }, { label: 'Phone' }, { label: 'Class' }, { label: 'Counsellor' }, { label: 'Stage' }, { label: 'Automated follow-up' }]}>{leads.map((x) => <tr key={x.id} className="border-b border-gray-50"><td className="px-6 py-3 font-medium text-[13px]">{x.name}</td><td className="py-3 text-[13px]">{x.phone}</td><td className="py-3 text-[13px]">{x.interested_class || '—'}</td><td className="py-3 text-[13px]">{x.counsellor || 'Unassigned'}</td><td className="py-3"><Badge color={x.stage === 'Admitted' ? 'green' : x.stage === 'Lost' ? 'red' : 'blue'}>{x.stage}</Badge></td><td className="py-3">Day 0, 1, 3, 7, 14</td></tr>)}</Table>{!leads.length && <div className="py-8 text-center text-[13px] text-[#999]">Add an enquiry to start the admissions funnel.</div>}</Card>
  </Layout>;
};

const FollowUpModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({
    owner: item.owner === 'Unassigned' ? '' : item.owner,
    last_contact: item.last_contact || new Date().toISOString().slice(0, 10),
    parent_response: item.parent_response || '',
    next_follow_up: item.next_follow_up || '',
    promise_amount: item.promise_amount || '',
    promise_date: item.promise_date || '',
    case_status: item.case_status || 'Open',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await onSave(item.fee_id, { ...form, promise_amount: Number(form.promise_amount || 0) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/45 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-poppins text-[21px] font-bold">Record Parent Call</p>
            <p className="mt-1 text-[13px] text-[#666]">{item.student_name} · {item.fee_name} · Outstanding: {money(item.due)}</p>
            <p className="mt-1 text-[12px] font-semibold text-[#C4141B]">{item.parent_name || 'Parent'} · {item.parent_phone || 'Phone not entered'}</p>
          </div>
          <button onClick={onClose} className="text-[13px] font-semibold text-[#666]">Close</button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-[12px] font-medium text-[#555]">Fee staff owner<input className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-[#f7f8f9] px-3 text-[13px]" value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="e.g. Fee Manager" /></label>
          <label className="text-[12px] font-medium text-[#555]">Call outcome<select className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-[#f7f8f9] px-3 text-[13px]" value={form.case_status} onChange={(event) => setForm({ ...form, case_status: event.target.value })}><option>Open</option><option>Attempted — No Answer</option><option>Contacted</option><option>Promise to Pay</option><option>Payment Plan</option><option>Escalated</option><option>Disputed</option><option>Closed</option></select></label>
          <label className="text-[12px] font-medium text-[#555]">Call date<input className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-[#f7f8f9] px-3 text-[13px]" type="date" value={form.last_contact} onChange={(event) => setForm({ ...form, last_contact: event.target.value })} /></label>
          <label className="text-[12px] font-medium text-[#555]">Next action date<input className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-[#f7f8f9] px-3 text-[13px]" type="date" value={form.next_follow_up} onChange={(event) => setForm({ ...form, next_follow_up: event.target.value })} /></label>
          <label className="text-[12px] font-medium text-[#555]">Parent promised amount<input className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-[#f7f8f9] px-3 text-[13px]" type="number" min="0" value={form.promise_amount} onChange={(event) => setForm({ ...form, promise_amount: event.target.value })} placeholder="0.00" /></label>
          <label className="text-[12px] font-medium text-[#555]">Promise payment date<input className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-[#f7f8f9] px-3 text-[13px]" type="date" value={form.promise_date} onChange={(event) => setForm({ ...form, promise_date: event.target.value })} /></label>
          <label className="md:col-span-2 text-[12px] font-medium text-[#555]">Parent response / call note<textarea className="mt-1 h-20 w-full rounded-lg border border-gray-200 bg-[#f7f8f9] px-3 py-2 text-[13px]" value={form.parent_response} onChange={(event) => setForm({ ...form, parent_response: event.target.value })} placeholder="Reason for non-payment, call note, instalment request or parent commitment" /></label>
        </div>

        <div className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-[12px] text-amber-800">This records the call only. The fee is settled only when a payment receipt is created.</div>
        <div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save call update'}</Btn></div>
      </div>
    </div>
  );
};

export const CollectionIntelligence = () => {
  const [data, setData] = useState({ buckets: [], fee_breakdown: [], cases: [], today: {}, reconciliation: {} });
  const [selectedAction, setSelectedAction] = useState('urgent_calls');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const { data: response } = await api.get('/collections-intelligence');
    setData(response);
  }, []);

  useEffect(() => { load().catch(() => setNotice('Could not load collection data.')); }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const cases = useMemo(() => data.cases || [], [data.cases]);
  const urgentCalls = cases.filter((item) => item.bucket === 'Critical' || item.bucket === 'High Priority');
  const followUpsToday = cases.filter((item) => item.next_follow_up && item.next_follow_up <= today);
  const promisesToday = cases.filter((item) => item.promise_date && item.promise_date <= today && item.case_status !== 'Paid' && item.case_status !== 'Closed');
  const upcomingReminders = cases.filter((item) => item.bucket === 'Upcoming');
  const todayCalls = cases.filter((item) => item.last_contact === today);
  const classOptions = [...new Set(cases.map((item) => item.class_name).filter(Boolean))].sort();
  const sectionOptions = [...new Set(cases.filter((item) => !selectedClass || item.class_name === selectedClass).map((item) => item.section).filter(Boolean))].sort();
  const largestFeeOutstanding = Math.max(1, ...(data.fee_breakdown || []).map((item) => Number(item.outstanding || 0)));
  const actionOptions = [
    { value: 'urgent_calls', label: 'Urgent dues — 30+ days overdue', help: 'Parents with critical and high-priority fee dues.', count: urgentCalls.length },
    { value: 'followups_today', label: 'Complete follow-ups due today', help: 'Parents who were already given a follow-up date.', count: followUpsToday.length },
    { value: 'promises_today', label: 'Check promised payments', help: 'Parents who promised to pay by today.', count: promisesToday.length },
    { value: 'upcoming_reminders', label: 'Send upcoming payment reminders', help: 'Fees due within the next 15 days.', count: upcomingReminders.length },
    { value: 'all_open', label: 'View all unpaid fee dues', help: 'Every unpaid fee, across all fee heads.', count: cases.length },
  ];
  const selectedActionInfo = actionOptions.find((item) => item.value === selectedAction) || actionOptions[0];
  const actionCases = useMemo(() => {
    if (selectedAction === 'followups_today') return followUpsToday;
    if (selectedAction === 'promises_today') return promisesToday;
    if (selectedAction === 'upcoming_reminders') return upcomingReminders;
    if (selectedAction === 'all_open') return cases;
    return urgentCalls;
  }, [selectedAction, cases, urgentCalls, followUpsToday, promisesToday, upcomingReminders]);
  const shownCases = useMemo(() => actionCases.filter((item) => (!selectedClass || item.class_name === selectedClass) && (!selectedSection || item.section === selectedSection)), [actionCases, selectedClass, selectedSection]);

  const saveFollowUp = async (feeId, form) => {
    try {
      await api.post(`/collections-intelligence/${feeId}/follow-up`, form);
      setEditing(null);
      setNotice('Collection follow-up saved. This account will now appear in the daily action agenda.');
      load();
    } catch (error) {
      setNotice(error.response?.data?.detail || 'Could not save the follow-up.');
    }
  };

  const downloadTodayCallReport = () => {
    const header = ['Student', 'Admission No', 'Class', 'Section', 'Parent', 'Phone', 'Fee Head', 'Outstanding', 'Call Outcome', 'Last Contact', 'Next Follow-up', 'Promise Amount', 'Promise Date', 'Parent Response'];
    const rows = todayCalls.map((item) => [item.student_name, item.admission_no, item.class_name, item.section, item.parent_name, item.parent_phone, item.fee_name, item.due, item.case_status, item.last_contact, item.next_follow_up, item.promise_amount, item.promise_date, item.parent_response]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `KDM-parent-call-update-${today}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Layout>
      <PageTitle title="Collection Intelligence" subtitle="Turn every outstanding fee into an owned follow-up case until it is paid, placed on an approved plan, or escalated." actions={<Btn variant="outline" onClick={load}>Refresh</Btn>} />

      {notice && <div className={`mb-5 rounded-xl border px-4 py-3 text-[13px] ${notice.includes('saved') ? 'border-green-100 bg-green-50 text-green-700' : 'border-red-100 bg-red-50 text-red-700'}`}>{notice}</div>}

      <Card className="mb-5" title="Collection Summary" subtitle="A simple school-wide view of every unpaid fee record.">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-red-100 bg-red-50/50 p-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Total outstanding</p>
            <p className="mt-1 text-3xl font-bold text-[#C4141B]">{money(data.outstanding)}</p>
            <p className="mt-1 text-sm text-gray-500">{cases.length} unpaid fee record{cases.length === 1 ? '' : 's'} across every fee head.</p>
          </div>
          <div className="rounded-xl bg-white px-5 py-3 text-sm text-gray-600 shadow-sm"><span className="font-semibold text-gray-800">Today’s work:</span> {shownCases.length} parent call{shownCases.length === 1 ? '' : 's'} in the selected queue</div>
        </div>
      </Card>

      <Card className="mb-5" title="Outstanding by Fee Type" subtitle="Each bar shows the unpaid amount for that fee type. One student can have dues under more than one fee.">
        {(data.fee_breakdown || []).length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(data.fee_breakdown || []).map((fee, index) => {
            const percent = Math.max(4, Math.round((Number(fee.outstanding || 0) / largestFeeOutstanding) * 100));
            const barColors = ['bg-[#C4141B]', 'bg-orange-500', 'bg-blue-600', 'bg-violet-600', 'bg-emerald-600'];
            return <div key={`${fee.fee_name}-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3"><p className="font-semibold text-gray-800">{fee.fee_name || fee.category || 'Other fee'}</p><span className="text-xs font-medium text-gray-500">{fee.fee_dues || 0} due</span></div>
              <p className="mt-3 text-xl font-bold text-gray-900">{money(fee.outstanding)}</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white"><div className={`h-full rounded-full ${barColors[index % barColors.length]}`} style={{ width: `${percent}%` }} /></div>
              <p className="mt-2 text-xs text-gray-500">Collected: {money(fee.collected)} · Expected: {money(fee.expected)}</p>
            </div>;
          })}
        </div> : <p className="py-6 text-center text-sm text-gray-500">No fee records are available yet.</p>}
      </Card>

      <Card className="mb-5" title="Select collection work" subtitle="Choose the action, class and section. The parent-call list updates automatically.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block text-sm font-semibold text-gray-700">Select action
            <select value={selectedAction} onChange={(event) => setSelectedAction(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#dfe4ea] bg-white px-3 text-[14px] font-semibold text-[#293241]">
              {actionOptions.map((item) => <option key={item.value} value={item.value}>{item.label} ({item.count})</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-gray-700">Select class
            <select value={selectedClass} onChange={(event) => { setSelectedClass(event.target.value); setSelectedSection(''); }} className="mt-2 h-12 w-full rounded-lg border border-[#dfe4ea] bg-white px-3 text-[14px] font-semibold text-[#293241]">
              <option value="">All classes</option>{classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-gray-700">Select section
            <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[#dfe4ea] bg-white px-3 text-[14px] font-semibold text-[#293241]">
              <option value="">All sections</option>{sectionOptions.map((section) => <option key={section} value={section}>{section}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-[13px] text-[#6f7a8a]"><span className="font-semibold text-gray-800">What to do:</span> {selectedActionInfo.help}</p>
      </Card>

      <Card className="mb-5" title="2. Parent call list" subtitle={`${shownCases.length} fee due(s) require this action. Each row shows the exact fee head and remaining amount.`} pad="p-0">
        <div className="overflow-x-auto">
          <Table columns={[{ label: 'Student' }, { label: 'Parent contact' }, { label: 'Fee to discuss' }, { label: 'Why call now' }, { label: 'Call update' }, { label: '' }]}>
            {shownCases.map((item) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="px-6 py-4 text-[13px] font-semibold">{item.student_name}<span className="block text-[11px] font-normal text-[#999]">{item.class_name || '—'} — {item.section || '—'} · {item.admission_no || '—'}</span></td>
                <td className="py-4 text-[12px]"><b>{item.parent_name || 'Parent'}</b><span className="block text-[#777]">{item.parent_phone || 'Phone not entered'}</span></td>
                <td className="py-4 text-[13px]"><b>{item.fee_name}</b><span className="block text-[11px] text-red-600">Outstanding: {money(item.due)}</span></td>
                <td className="py-4 text-[12px]"><Badge color={item.bucket === 'Critical' ? 'red' : item.bucket === 'High Priority' ? 'amber' : item.bucket === 'Upcoming' ? 'blue' : 'gray'}>{item.bucket}</Badge><span className="mt-1 block text-[#777]">{item.days_overdue ? `${item.days_overdue} days overdue` : item.default_action}</span></td>
                <td className="py-4 text-[12px]"><Badge color={item.case_status === 'Escalated' || item.case_status === 'Disputed' ? 'red' : item.case_status === 'Promise to Pay' || item.case_status === 'Payment Plan' ? 'amber' : 'blue'}>{item.case_status}</Badge><span className="mt-1 block text-[#777]">{item.last_contact ? `Updated ${item.last_contact}` : 'Not contacted yet'}</span></td>
                <td className="py-4 pr-6 text-right"><div className="flex justify-end gap-3">{item.parent_phone && <a href={`tel:${item.parent_phone}`} className="text-[12px] font-semibold text-[#293241]">Call parent</a>}<button onClick={() => setEditing(item)} className="text-[12px] font-semibold text-[#C4141B]">Record call</button></div></td>
              </tr>
            ))}
          </Table>
          {!shownCases.length && <div className="py-14 text-center text-[13px] text-[#999]">No parent calls are waiting for this action.</div>}
        </div>
      </Card>

      <Card title="3. KDM daily parent-call update" subtitle="Download only the calls recorded today. Share this file with the KDM after you finish the call list." actions={<Btn variant="outline" onClick={downloadTodayCallReport}>Download today’s calls ({todayCalls.length})</Btn>}>
        <p className="text-[13px] text-[#647082]">The report includes the parent contact, fee discussed, outstanding balance, call outcome, promise details and next follow-up date.</p>
      </Card>

      {editing && <FollowUpModal item={editing} onClose={() => setEditing(null)} onSave={saveFollowUp} />}
    </Layout>
  );
};
