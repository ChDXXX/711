// StudentCarousel.jsx
import { Carousel } from "@mantine/carousel"
import { useMediaQuery } from "@mantine/hooks"
import { useMantineTheme } from "@mantine/core"
import StudentCard from "./StudentCard"
import "@mantine/carousel/styles.css"
import classes from "./StudentCarousel.module.css"


const students = [
  {
    id: 1,
    name: "Alice Johnson",
    school: "QUT",
    image: "https://randomuser.me/api/portraits/women/4.jpg"
  },
  {
    id: 2,
    name: "Bob Smith",
    school: "UQ",
    image: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    id: 3,
    name: "Clara Lee",
    school: "Griffith University",
    image: "https://randomuser.me/api/portraits/women/3.jpg"
  },
  {
    id: 4,
    name: "Emily Nguyen",
    school: "Griffith University",
    image: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    id: 5,
    name: "Steve Lawrence",
    school: "Sunshine Coast University",
    image: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    id: 6,
    name: "Peter Marina",
    school: "QUT",
    image: "https://randomuser.me/api/portraits/men/3.jpg"
  }
]

function StudentCarousel() {
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  return (
    <Carousel
      withControls
      withIndicators
      slideSize={{ base: "100%", md: "50%", lg: "20%" }}
      slideGap="xl"
      align="start"
      slidesToScroll={{ sm: 1, md: 2, lg: 5 }}
      classNames={{ indicator: classes.indicator, control: classes.control }}
      style={{ paddingBottom: "40px" }}
    >
      {students.map((student) => (
        <Carousel.Slide key={student.id}>
          <StudentCard {...student} />
        </Carousel.Slide>
      ))}
    </Carousel>
  )
}

export default StudentCarousel
