import { Box, Typography } from "@mui/material"

interface TestimonialCardProps {
  imageSrc: string
}

export function TestimonialCard({ imageSrc }: TestimonialCardProps) {
  return (
    <Box sx={{ position: "relative", paddingTop: "56.25%", borderRadius: 2, overflow: "hidden", mb: 2 }}>
      <Box
        component="img"
        src={imageSrc}
        alt="Testimonial video thumbnail"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <Typography variant="body2" color="white">
          Testimonial text here
        </Typography>
      </Box>
    </Box>
  )
}

