import React, {useState} from "react";
import { Box } from "@mantine/core";
import SkillVerifyList from "../../components/SkillVerifyList"
import SkillVerifyModal from "../../components/SkillVerifyModal";


export default function SchoolVerifySkill() {
  // Detail Model
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleRowClick = (submission) => {
    // 跳转到携带该申请记录id路径的页面
  };

  const openModal = (submission) => {
    setSelected(submission);
    setOpened(true);
  };

  const handleApprove = () => {
    // 发请求：批准接口
    console.log('批准', selected);
    setOpened(false);
  };

  const handleReject = () => {
    // 发请求：拒绝接口
    console.log('拒绝', selected);
    setOpened(false);
  };

  return (
    <Box flex={1}>
      <SkillVerifyList 
      ononRowClick={handleRowClick}/>
      <SkillVerifyModal 
      opened={opened}
      setOpened={setOpened}
      selected={selected}
      openModal={openModal}
      handleApprove={handleApprove}
      handleReject={handleReject}/>
    </Box>
  );
}
