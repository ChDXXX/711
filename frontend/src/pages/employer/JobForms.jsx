import React, { useEffect, useState } from "react";
import {
  Box, TextInput, Textarea, Button, Table, Text, Group, Center,
  Loader, Modal, Pagination, MultiSelect, NumberInput
} from "@mantine/core";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 5;

export default function JobForms() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState([]);
  const [positions, setPositions] = useState(1);
  const [editingJob, setEditingJob] = useState(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewJob, setPreviewJob] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    const token = await user.getIdToken();
    const res = await axios.get(`${BASE_URL}/job/list?uid=${user.uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setJobs(res.data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const token = await user.getIdToken();

    const payload = {
      uid: user.uid,
      title,
      description,
      price,
      location,
      skills,
      positions,
    };

    try {
      if (editingJob) {
        await axios.put(`${BASE_URL}/job/update/${editingJob}`, { ...payload }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${BASE_URL}/job/create`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      resetForm();
      fetchJobs();
    } catch (error) {
      console.error("Submit failed:", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job) => {
    setTitle(job.title);
    setDescription(job.description);
    setPrice(job.price || 0);
    setLocation(job.location || "");
    setSkills(job.skills || []);
    setPositions(job.positions || 1);
    setEditingJob(job.id);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice(0);
    setLocation("");
    setSkills([]);
    setPositions(1);
    setEditingJob(null);
  };

  const confirmDelete = (id) => {
    setConfirmDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    const token = await user.getIdToken();
    await axios.delete(`${BASE_URL}/job/delete/${confirmDeleteId}?uid=${user.uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowDeleteModal(false);
    fetchJobs();
  };

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box>
      <Text fw={600} mb="xs">{editingJob ? "Edit Job" : "Post a Job"}</Text>

      <TextInput label="Job Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} mb="sm" />
      <Textarea label="Job Description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} mb="sm" />
      <NumberInput label="Hourly Rate ($)" value={price} onChange={setPrice} min={0} mb="sm" />
      <TextInput label="Location" value={location} onChange={(e) => setLocation(e.currentTarget.value)} mb="sm" />
      <MultiSelect
        label="Required Skills"
        placeholder="Enter or select"
        searchable
        creatable
        value={skills}
        onChange={setSkills}
        data={skills}
        getCreateLabel={(query) => `+ Add "${query}"`}
        onCreate={(query) => setSkills((prev) => [...prev, query])}
        mb="sm"
      />
      <NumberInput label="Open Positions" value={positions} onChange={setPositions} min={1} mb="md" />

      <Group>
        <Button onClick={handleSubmit} loading={submitting}>
          {editingJob ? "Update Job" : "Create Job"}
        </Button>
        {editingJob && (
          <Button variant="outline" color="gray" onClick={resetForm}>
            Cancel
          </Button>
        )}
      </Group>

      <Box mt="xl">
        <Text fw={600} mb="xs">My Jobs</Text>
        <TextInput placeholder="Search..." value={search} onChange={(e) => setSearch(e.currentTarget.value)} mb="sm" />

        {loading ? (
          <Center><Loader /></Center>
        ) : paginatedJobs.length === 0 ? (
          <Text c="dimmed">No matching jobs found.</Text>
        ) : (
          <>
            <Table withBorder>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Rate ($)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.location}</td>
                    <td>{job.price}</td>
                    <td>
                      <Group gap="xs">
                        <Button size="xs" onClick={() => setPreviewJob(job)}>Preview</Button>
                        <Button size="xs" onClick={() => handleEdit(job)}>Edit</Button>
                        <Button size="xs" color="red" variant="outline" onClick={() => confirmDelete(job.id)}>Delete</Button>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination
              value={page}
              onChange={setPage}
              total={Math.ceil(filteredJobs.length / PAGE_SIZE)}
              mt="md"
            />
          </>
        )}
      </Box>

      {/* Delete Modal */}
      <Modal opened={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete" centered>
        <Text>Are you sure you want to delete this job?</Text>
        <Group mt="md">
          <Button color="red" onClick={handleDelete}>Yes, Delete</Button>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
        </Group>
      </Modal>

      {/* Preview Modal */}
      <Modal opened={!!previewJob} onClose={() => setPreviewJob(null)} title={previewJob?.title || "Preview"} centered>
        <Text fw={600} mb="sm">Description</Text>
        <Text mb="sm">{previewJob?.description}</Text>
        <Text>Rate: ${previewJob?.price}</Text>
        <Text>Location: {previewJob?.location}</Text>
        <Text>Skills: {previewJob?.skills?.join(", ")}</Text>
        <Text>Open Positions: {previewJob?.positions}</Text>
      </Modal>
    </Box>
  );
}