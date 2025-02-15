import type React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface DonationCardProps {
  value: React.ReactNode;
  label: React.ReactNode;
}

export const DonationCard: React.FC<DonationCardProps> = ({ value, label }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
      <Card
        sx={{
          minWidth: "310px", // ✅ Controls width to keep it compact
          maxHeight: "120px", // ✅ Prevents excessive height expansion
          display: "flex", // ✅ Enables flexbox for vertical alignment
          flexDirection: "column", // ✅ Align content in column layout
          alignItems: "center", // ✅ Centers items horizontally
          justifyContent: "center", // ✅ Centers items vertically
          textAlign: "center", // ✅ Ensures text is centered
          padding: "4px", // ✅ Keeps padding minimal
          mb: 1, // ✅ Reduce margin-bottom to avoid extra spacing
          backgroundColor: "rgb(255, 255, 255)", 
          color: "#fff", 
          borderRadius: 0, 
          border: "1px solid rgba(155, 155, 155, 0.8)", 
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.4)"
        }}
      >
        <CardContent 
          sx={{ 
            padding: "8px", 
            display: "flex", // ✅ Enables flexbox
            flexDirection: "column", // ✅ Ensures text stacks properly
            alignItems: "center", // ✅ Centers text horizontally
            justifyContent: "center", // ✅ Centers content vertically
            width: "100%" // ✅ Ensures proper spacing
          }}
        >
          <Typography
            variant="h6" // ✅ Reduce font size from h4/h5 to h6
            component="div"
            align="center"
            sx={{ fontWeight: "bold", mb: 0.5 }} // ✅ Reduce margin bottom
          >
            {typeof value === "number" && value % 1 === 0 ? value : value}
          </Typography>
          <Typography variant="body2" align="center" sx={{ fontSize: "0.8rem" }}> 
            {label} {/* ✅ Smaller font to avoid height expansion */}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}  


