import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  Box,
  Title,
  Badge,
  Text,
  MultiSelect,
  Loader,
  Center
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { fetchJobById, updateJob, findStudentsBySkill, assignJob, verifyJobCompletion } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { fetchSoftSkills } from '../../services/jobService';
import StudentCard from "../../components/employer/StudentCard";


const EditJobPage = () => {
  const { token } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentSkill, setCurrentSkill] = useState('');
  const [softSkillOptions, setSoftSkillOptions] = useState([]);
  const [matchedStudents, setMatchedStudents] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [openedModalId, setOpenedModalId] = useState(null);
  

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      location: '',
      price: 0,
      skills: [],
      softSkills: [],
      assignments: [], // needed for tracking student assignment status
    },
  });

  useEffect(() => {
    const loadJob = async () => {
      try {
        const job = await fetchJobById(jobId, token);

        // Set form values
        form.setValues(job);


        const softSkillsFromDB = await fetchSoftSkills(token);
        setSoftSkillOptions(softSkillsFromDB.map(s => ({ value: s.id, label: s.name })));

        // All assignments (including rejected ones)
        const allAssignments = job.assignments || [];

        // Set read-only if any assignment is not rejected or job is verified
        const nonRejected = allAssignments.filter(a => a.status !== 'rejected');
        if (nonRejected.length > 0 || job.verified === true) {
          setIsReadOnly(true);
        }

        // Store assigned students with their statuses
        const assignedStudentsWithStatus = allAssignments
          .filter(a => a.student)
          .map(a => ({
            ...a.student,
            status: a.status,
          }));

        setAssignedUsers(assignedStudentsWithStatus);

        const studentMap = new Map();
        
        // Load matched students
        console.log("🔍 开始查询学生技能匹配...");
        console.log("📋 技能列表:", job.skills);
        
        for (const skill of job.skills || []) {
          try {
            console.log(`🔍 查询技能: ${skill}`);
            const students = await findStudentsBySkill(skill, token, job.softSkills || []);
            console.log(`✅ 查询到 ${students.length} 名匹配学生`);

            for (const student of students) {
              if (!studentMap.has(student.id)) {
                console.log(`➕ 添加新学生: ${student.id}`);
                studentMap.set(student.id, student);
              } else {
                // Merge skill titles and accumulate soft skill match count
                console.log(`🔄 合并已有学生技能: ${student.id}`);
                const existing = studentMap.get(student.id);
                existing.skills = Array.from(new Set([
                  ...(existing.skills || []),
                  ...(student.skills || []),
                ]));

                existing.softSkillMatchCount =
                  (existing.softSkillMatchCount || 0) + (student.softSkillMatchCount || 0);

                studentMap.set(student.id, existing);
              }
            }
          } catch (err) {
            console.error(`❌ 查询技能 "${skill}" 失败:`, err);
          }
        }

        // Convert map to array and sort by softSkillMatchCount descending
        const sorted = [...studentMap.values()].sort(
          (a, b) => (b.softSkillMatchCount || 0) - (a.softSkillMatchCount || 0)
        );
        
        console.log(`📊 总共找到 ${sorted.length} 名匹配学生`);
        if (sorted.length > 0) {
          console.log(`📋 第一名学生示例:`, JSON.stringify({
            id: sorted[0].id,
            name: sorted[0].name,
            skills: sorted[0].skills
          }));
        }
        
        setMatchedStudents(sorted);
      } catch (err) {
        console.error('Failed to load job', err);
        alert('Job not found or access denied.');
        navigate('/employer/jobs-list');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, token]);

  const handleAddSkill = () => {
    const trimmed = currentSkill.trim();
    if (trimmed && !form.values.skills.includes(trimmed)) {
      form.setFieldValue('skills', [...form.values.skills, trimmed]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    form.setFieldValue(
      'skills',
      form.values.skills.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (values) => {
    try {
      // 只提取必要的字段，避免不兼容字段
      const jobData = {
        title: values.title,
        description: values.description,
        price: values.price,
        location: values.location,
        skills: values.skills || []
      };
      
      console.log("📤 提交Job更新数据:", jobData);
      await updateJob(jobId, jobData, token);
      alert('Job updated successfully');
      navigate('/employer/jobs-list', { state: { reload: true } });
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update job.');
    }
  };

  if (loading) {
    return <Center mt="lg"><Loader /></Center>;
  }

  return (
    <Container style={{ maxWidth: '100%', width: '100%' }}>
      <Title order={2} mb="md">Edit Job</Title>

      {isReadOnly && (
        <Text c="red" mb="sm">
          This job cannot be edited because at least one student has accepted, is assigned, or it is verified.
        </Text>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Title"
          required
          disabled={isReadOnly}
          {...form.getInputProps('title')}
        />
        <Textarea
          label="Description"
          required
          mt="md"
          minRows={4}
          disabled={isReadOnly}
          {...form.getInputProps('description')}
        />
        <TextInput
          label="Location"
          required
          mt="md"
          disabled={isReadOnly}
          {...form.getInputProps('location')}
        />
        <NumberInput
          label="Price"
          required
          disabled={isReadOnly}
          mt="md"
          min={0}
          {...form.getInputProps('price')}
        />

        <TextInput
          label="Add Skill"
          value={currentSkill}
          onChange={(e) => setCurrentSkill(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSkill();
            }
          }}
          disabled={isReadOnly}
          mt="md"
        />
        {!isReadOnly && <Button mt="sm" onClick={handleAddSkill}>Add Skill</Button>}

        <Group mt="sm" spacing="xs">
          {form.values.skills.map((skill, index) => (
            <Badge
              key={index}
              rightSection={
                <span
                  style={{ cursor: 'pointer', marginLeft: 8 }}
                  onClick={() => handleRemoveSkill(index)}
                >
                  {!isReadOnly && <Text>×</Text>}
                </span>
              }
            >
              {skill}
            </Badge>
          ))}
        </Group>

        <MultiSelect
          label="Soft Skills"
          placeholder="Select soft skills"
          data={softSkillOptions}
          value={form.values.softSkills}
          onChange={(value) => form.setFieldValue('softSkills', value)}
          disabled={isReadOnly}
          searchable
          clearable
          mt="lg"
        />        

        <Button type="submit" mt="xl" fullWidth disabled={isReadOnly}>Update Job</Button>
      </form>

      {matchedStudents.length > 0 && (
        <Box mt="xl">
          <Title order={4}>Matching Students ({matchedStudents.length})</Title>
          <Group mt="md" spacing="md">
            {matchedStudents.map((student) => {
              // 旧方法：查找assignments中的状态
              const oldAssignment = (form.values.assignments || []).find(
                (a) => a.studentId === student.id
              );
              
              // 新方法：直接检查job的studentId和status
              const isAssigned = job.studentId === student.id;
              const jobStatus = isAssigned ? job.status : null;
              
              // 使用正确的状态值
              const status = jobStatus || oldAssignment?.status || null;
              
              console.log(`🔍 学生${student.id}状态: assigned=${isAssigned}, status=${status}`);

              const showVerifyButton = status === 'completed';

              // These are statuses that mean "job already handled"
              const finalStatuses = ["assigned", "accepted", "rejected", "completed", "verified"];
              
              // Determine whether to show the assign button
              const showAssignButton = (!status || !finalStatuses.includes(status));

              return (
                <StudentCard
                  key={student.id}
                  studentId={student.studentId || student.id}
                  {...student}
                  setOpenedModalId={setOpenedModalId}
                  openedModalId={openedModalId}                  
                  status={status}
                  readonly={!showAssignButton}
                  highlight=""
                  showTechnicalSkills={false}
                  showAssignButton={showAssignButton}
                  onAssignClick={async (studentId) => {
                    try {
                      await assignJob(jobId, studentId, token);
                      alert(`Job assigned to ${student.name || student.email}`);
                      navigate('/employer/jobs-list', { state: { reload: true } });
                    } catch (err) {
                      console.error("Failed to assign:", err);
                      alert("Failed to assign job");
                    }
                  }}
                  showVerifyButton={showVerifyButton}
                  verifyJob={async (studentId) => {
                    try {
                      await verifyJobCompletion(jobId, token);
                      alert(`Job verified successfully`);
                      navigate('/employer/jobs-list', { state: { reload: true } });
                    } catch (err) {
                      console.error('Verification failed:', err);
                      alert('Failed to verify job');
                    }
                  }}                  
                />
              );
            })}
          </Group>
        </Box>
      )}
    </Container>
  );
};

export default EditJobPage;
