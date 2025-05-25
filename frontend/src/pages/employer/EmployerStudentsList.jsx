import { MultiSelect, Card, Avatar, Text, Group, Grid, Box, Select, Progress, Button, Modal, Stack, TextInput } from '@mantine/core';
import { IconBrandHtml5, IconBrandCss3, IconBrandJavascript, IconBrandPython, IconBrandReact, IconBrandNodejs, IconBrandMessenger, IconBrandTeams } from '@tabler/icons-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

import StudentCard from "../../components/employer/StudentCard";
import { searchStudentsBySkills } from "../../services/employerService";
import { fetchSoftSkills  } from '../../services/jobService';

const EmployerStudentsList = () => {
  const [assignedJobs, setAssignedJobs] = useState({});
  const [openedModalId, setOpenedModalId] = useState(null);
  const [selectedSoftSkills, setSelectedSoftSkills] = useState([]);
  const [selectedTechSkills, setSelectedTechSkills] = useState([]);
  const [students, setStudents] = useState([]);
  const { token } = useAuth();
  const [softSkillOptions, setSoftSkillOptions] = useState([]);


  useEffect(() => {
    const loadData = async () => {
      try {
        // Load students based on selected filters
        const result = await searchStudentsBySkills(selectedTechSkills, selectedSoftSkills, token);
        console.log(result);
        setStudents(result);

        // Load soft skills for dropdown filter
        const softSkills = await fetchSoftSkills(token);
        setSoftSkillOptions(softSkills.map(s => ({ value: s.id, label: s.name })));

        
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };

    if (token) loadData();
  }, [selectedTechSkills, selectedSoftSkills, token]);


  const handleJobChange = (studentId, job) => {
    setAssignedJobs((prev) => ({ ...prev, [studentId]: job }));
  };
  
  return (
    <Box flex={1} mt="30px">
      <Grid gutter="xl">

        {/* Technical Skills Filter */}
        <Grid.Col span={6}>
          <TextInput
            label="Filter by Technical Skills"
            value={selectedTechSkills.join(", ")}
            onChange={(e) => {
              const input = e.currentTarget.value;
              const parsed = input
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s !== "");
              setSelectedTechSkills(parsed);
            }}
            placeholder="e.g. React, Node.js, Python"
          />
        </Grid.Col>

        {/* Soft Skills Filter */}
        <Grid.Col span={6}>
          <MultiSelect
            label="Filter by Soft Skills"
            data={softSkillOptions}
            value={selectedSoftSkills}
            onChange={setSelectedSoftSkills}
            searchable
            clearable
            placeholder="Select soft skills"
          />
        </Grid.Col>        
        {students.map((student) => (
          <Grid.Col key={student.id} span={{ base: 12, sm: 6, md: 4, lg: 4 }}>
            <StudentCard
              {...student}
              showTechnicalSkills = {false}
              setOpenedModalId={setOpenedModalId}
              openedModalId={openedModalId}
              assignedJobs={assignedJobs}
              showAssignButton={false}
              handleJobChange={handleJobChange}
            />
                 
          </Grid.Col>
        ))}
      </Grid>
    </Box>
  );
};

export default EmployerStudentsList;
