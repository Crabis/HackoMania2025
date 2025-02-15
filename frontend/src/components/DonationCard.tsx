import type React from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface DonationCardProps {
  value: React.ReactNode;
  label: string;
}

export const DonationCard: React.FC<DonationCardProps> = ({ value, label }) => {
  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: "rgba(0, 0, 0, 0.35)", // Dark grey with slight transparency
        color: "#fff", // White text for better contrast
        borderRadius: 2, // Slightly rounded corners
        border: "1px solid rgb(27, 27, 27,0.8)", // Thin white outline
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)", // Subtle shadow for depth
      }}
    >
      <CardContent>
        <Typography variant="h4" component="div" align="center" sx={{ fontWeight: "bold", mb: 1 }}>
          {typeof value === "number" && value % 1 === 0 ? value : value}
        </Typography>
        <Typography variant="body2" align="center">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};


