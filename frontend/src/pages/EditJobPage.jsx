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
  Text
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { fetchJobById, updateJob, findStudentsBySkill, assignJob } from '../services/jobService';
import { useAuth } from '../context/AuthContext';

const EditJobPage = () => {
  const { token } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentSkill, setCurrentSkill] = useState('');
  const [matchedStudents, setMatchedStudents] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [assignedUser, setAssignedUser] = useState(null);




  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      location: '',
      price: 0,
      skills: [],
    },
  });

  useEffect(() => {
    const loadJob = async () => {
      try {
        const job = await fetchJobById(jobId, token);
        form.setValues(job);

        if (job.studentId || job.status === 'completed' || job.verified === true) {
            setIsReadOnly(true);
        }
        if (job.assignedUser) {
            setAssignedUser(job.assignedUser);
        }

        for (const skill of job.skills || []) {
            
            try {
              const students = await findStudentsBySkill(skill, token);
              setMatchedStudents(prev => {
                const unique = [...prev, ...students];
                return [...new Map(unique.map(s => [s.id, s])).values()];
              });
            } catch (err) {
              console.error(`Error finding students for skill "${skill}":`, err);
            }
        }

      } catch (err) {
        console.error('Failed to load job', err);
        alert('Job not found or access denied.');
        navigate('/employer');
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
      await updateJob(jobId, values, token);
      alert('Job updated successfully');
      navigate('/employer', { state: { reload: true } });
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update job.');
    }
  };

  if (loading) return <p>Loading...</p>;

  

  return (
    <Container size="sm">
      <Title order={2} mb="md">Edit Job</Title>
      {isReadOnly && (
        <Text c="red" mb="sm">
            This job cannot be edited because it is already {form.values.status}{form.values.verified ? ' and verified' : ''}.
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

        <Button type="submit" mt="xl" fullWidth disabled={isReadOnly}>Update Job</Button>
      </form>
      {!isReadOnly && matchedStudents.length > 0 && (
        <Box mt="xl">
            <Title order={4}>Matching Students</Title>
            <Group mt="md" spacing="md">
            {matchedStudents.map(student => (
                <Box key={student.id} p="sm" shadow="sm" radius="md" withBorder style={{ width: '100%' }}>
                <Text fw={600}>{student.name || student.email}</Text>
                <Text size="sm" c="dimmed">Skills: {(student.skills || []).join(', ')}</Text>
                <Button
                    mt="sm"
                    size="xs"
                    onClick={async () => {
                    try {
                        await assignJob(jobId, student.id, token);
                        alert(`Job assigned to ${student.name || student.email}`);
                        navigate('/employer', { state: { reload: true } });
                    } catch (err) {
                        alert('Failed to assign job');
                    }
                    }}
                >
                    Assign Job
                </Button>
                </Box>
            ))}
            </Group>
        </Box>
    )}
    {isReadOnly && assignedUser && (
        <Box mt="xl">
            <Title order={4}>Assigned Student</Title>
            <Box p="sm" shadow="sm" radius="md" withBorder>
            <Text fw={600}>{assignedUser.name || assignedUser.email}</Text>
            <Text size="sm" c="dimmed">Email: {assignedUser.email}</Text>
            <Text size="sm" c="dimmed">School ID: {assignedUser.schoolId || 'N/A'}</Text>
            </Box>
        </Box>
    )}

    </Container>
  );
};

export default EditJobPage;
