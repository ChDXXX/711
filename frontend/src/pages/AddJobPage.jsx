import React, { useState } from 'react';
import {
  Container,
  Group,
  Box,
  TextInput,
  Button,
  Textarea,
  NumberInput,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/jobService';
import { useAuth } from '../context/AuthContext';

const AddJobPage = () => {
  const navigate = useNavigate();
  const { user, role, token } = useAuth();

  const [currentSkill, setCurrentSkill] = useState('');

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      location: '',
      price: 0,
      skills: [],
    },
    validate: {
      title: (value) => (value ? null : 'Title is required'),
      description: (value) => (value ? null : 'Description is required'),
      location: (value) => (value ? null : 'Location is required'),
      price: (value) => (value > 0 ? null : 'Price must be greater than 0'),
      skills: (value) => (value.length > 0 ? null : 'At least one skill is required'),
    },
  });

  const handleAddSkill = () => {
    const skill = currentSkill.trim();
    if (skill && !form.values.skills.includes(skill)) {
      form.setFieldValue('skills', [...form.values.skills, skill]);
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
      const jobData = {
        ...values,
        price: Number(values.price),
      };

      await createJob(jobData, token);
      console.log('Job submitted:', jobData);
      alert('Job Added successfully');
      navigate('/employer', { state: { reload: true } });
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  return (
    <Container style={{ maxWidth: '100%', width: '100%' }}>
      <h1>Add New Job</h1>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Job Title"
          placeholder="Enter job title"
          required
          mt="md"
          withAsterisk
          fullWidth
          {...form.getInputProps('title')}
        />
        <Textarea
          label="Description"
          placeholder="Enter detailed job description"
          required
          mt="md"
          minRows={4}
          withAsterisk
          fullWidth
          {...form.getInputProps('description')}
        />
        <TextInput
          label="Location"
          placeholder="Enter job location"
          required
          mt="md"
          withAsterisk
          fullWidth
          {...form.getInputProps('location')}
        />
        <NumberInput
          label="Price"
          placeholder="Enter job price"
          required
          mt="md"
          min={0}
          withAsterisk
          fullWidth
          {...form.getInputProps('price')}
        />

        <TextInput
          label="Add Skill"
          placeholder="e.g., Python"
          value={currentSkill}
          onChange={(e) => setCurrentSkill(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSkill();
            }
          }}
          mt="md"
          fullWidth
        />
        <Button mt="sm" onClick={handleAddSkill}>
          Add Skill
        </Button>

        <Group mt="sm" spacing="xs">
          {form.values.skills.map((skill, index) => (
            <Badge
              key={index}
              variant="filled"
              color="blue"
              rightSection={
                <span
                  style={{ cursor: 'pointer', marginLeft: 8 }}
                  onClick={() => handleRemoveSkill(index)}
                >
                  ×
                </span>
              }
            >
              {skill}
            </Badge>
          ))}
        </Group>

        {form.errors.skills && (
          <Box mt="sm" style={{ color: 'red' }}>
            {form.errors.skills}
          </Box>
        )}

        <Button type="submit" mt="xl" fullWidth>
          Submit Job
        </Button>
      </form>
    </Container>
  );
};

export default AddJobPage;
