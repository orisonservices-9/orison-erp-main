import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../../layouts/Layout';
import AttendanceTab from './tabs/AttendanceTab';
import FeesTab from './tabs/FeesTab';
import AcademicsTab from './tabs/AcademicsTab';
import ProfileEditTab from './tabs/ProfileEditTab';
import DocumentsTab from './tabs/DocumentsTab';
import { Loader2 } from 'lucide-react';
import api from '../../../api/client';
import { LiquidUnderline } from '../../../motion/LiquidTabs';

const TABS = ['Profile', 'Fees', 'Academics', 'Attendance', 'Documents'];

const StudentProfile = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id') || 'EP-2024-0812';
  const [tab, setTab] = useState('Attendance');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    setDetail(null);
    api.get(`/students/${id}/detail`).then(({ data }) => setDetail(data)).catch(() => {});
  }, [id]);

  const breadcrumbMap = { Profile: 'Edit Profile', Academics: 'Academics', Fees: 'Fees', Attendance: 'Attendance', Documents: 'Documents' };

  return (
    <Layout>
      <div className="text-[13px] mb-4">
        <span className="text-[#4F46E5] cursor-pointer hover:underline" onClick={() => navigate('/students/view')}>View Students</span>
        <span className="text-[#c0c0c0] mx-2">&gt;</span>
        <span className="text-[#4F46E5] cursor-pointer">Student Profile</span>
        <span className="text-[#c0c0c0] mx-2">&gt;</span>
        <span className="text-[#888]">{breadcrumbMap[tab]}</span>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <LiquidUnderline tabs={TABS} value={tab} onChange={setTab} />
      </div>

      {!detail ? (
        <div className="flex items-center justify-center py-24 text-[#999]"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <>
          {tab === 'Profile' && <ProfileEditTab detail={detail} />}
          {tab === 'Fees' && <FeesTab detail={detail} />}
          {tab === 'Academics' && <AcademicsTab detail={detail} />}
          {tab === 'Attendance' && <AttendanceTab detail={detail} />}
          {tab === 'Documents' && <DocumentsTab detail={detail} />}
        </>
      )}
    </Layout>
  );
};

export default StudentProfile;
