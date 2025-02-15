import type React from "react"
import { Card, CardContent, Typography } from "@mui/material"

interface DonationCardProps {
  value: string | number
  label: string
}

export const DonationCard: React.FC<DonationCardProps> = ({ value, label }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h4" component="div" align="center" sx={{ fontWeight: "bold", mb: 1 }}>
          {typeof value === "number" && value % 1 === 0 ? value : value}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {label}
        </Typography>
      </CardContent>
    </Card>
  )
}

