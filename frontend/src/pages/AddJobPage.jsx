import React from 'react';
import { Container, Group, Box, TextInput, Button, Textarea, NumberInput, MultiSelect } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/jobService';
import { useAuth } from "../context/AuthContext";

const AddJobPage = () => {
  const navigate = useNavigate();
  const { user, role, token } = useAuth();
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

  const handleSubmit = async (values) => {
    
    try {
      // Ensure skills is an array
      const jobData = {
        ...values,
        price: Number(values.price),
      };
      
      await createJob(jobData, token);
      console.log('Job submitted:', jobData);
      navigate('/employer'); // Redirect after submission
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  return (
    <Container size="sm">
      <h1>Add New Job</h1>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Job Title"
          placeholder="Enter job title"
          required
          mt="md"
          {...form.getInputProps('title')}
        />
        <Textarea
          label="Description"
          placeholder="Enter detailed job description"
          required
          mt="md"
          minRows={4}
          {...form.getInputProps('description')}
        />
        <TextInput
          label="Location"
          placeholder="Enter job location"
          required
          mt="md"
          {...form.getInputProps('location')}
        />
        <NumberInput
          label="Price"
          placeholder="Enter job price"
          required
          mt="md"
          min={0}
          {...form.getInputProps('price')}
        />
        <MultiSelect
          label="Required Skills"
          placeholder="Select required skills"
          required
          mt="md"
          data={[
            { value: 'javascript', label: 'JavaScript' },
            { value: 'react', label: 'React' },
            { value: 'node', label: 'Node.js' },
            { value: 'python', label: 'Python' },
            { value: 'java', label: 'Java' },
            { value: 'c++', label: 'C++' },
            { value: 'design', label: 'Design' },
            { value: 'marketing', label: 'Marketing' },
          ]}
          searchable
          creatable
          getCreateLabel={(query) => `+ Add ${query}`}
          onCreate={(query) => {
            const item = { value: query.toLowerCase(), label: query };
            return item;
          }}
          {...form.getInputProps('skills')}
        />
        <Button type="submit" mt="xl" fullWidth>Submit Job</Button>
      </form>
    </Container>
  );
};

export default AddJobPage;