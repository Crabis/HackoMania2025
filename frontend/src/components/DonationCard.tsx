import { Card, CardContent, Typography } from "@mui/material"

interface DonationCardProps {
  amount: string
  label: string
}

export function DonationCard({ amount, label }: DonationCardProps) {
  return (
    <Card sx={{ minWidth: 275, textAlign: "center", mb: 2 }}>
      <CardContent>
        <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
          {amount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  )
}

