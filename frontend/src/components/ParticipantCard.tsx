import { Card, CardContent, Typography } from "@mui/material"

interface ParticipantCardProps {
  count: number
  label: string
}

export function ParticipantCard({ count, label }: ParticipantCardProps) {
  return (
    <Card sx={{ minWidth: 275, textAlign: "center", mb: 2 }}>
      <CardContent>
        <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
          {count}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  )
}

