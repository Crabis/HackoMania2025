import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase
const supabase = createClient(
  "https://qagsbbilljqjmauhylgo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3NiYmlsbGpxam1hdWh5bGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTczNzAsImV4cCI6MjA1NTE3MzM3MH0.5R8oQ9Zh_w6R7cDDhAU9xKZlMOk2jU3cCgO72uu91qU"
);

// ✅ Define the `Donation` type properly
interface Donation {
  id: string;
  amount: number;
  donation_date: string;
  guardian_id: string;
  category: string;
  username: string; // Retrieved from `users` table
}

// ✅ Define the component with a properly typed `category` prop
const DonationsFeed: React.FC<{ category: string }> = ({ category }) => {
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    // ✅ Fetch latest donations & donor usernames
    const fetchDonations = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("id, amount, donation_date, guardian_id, category") // ✅ Fetch only necessary fields
        .eq("category", category)
        .order("donation_date", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching donations:", error);
        return;
      }

      // ✅ Fetch donor usernames from the `users` table
      const donationsWithUsers: Donation[] = await Promise.all(
        data.map(async (donation) => {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("username")
            .eq("id", donation.guardian_id)
            .single();

          return {
            ...donation,
            username: userError ? "Anonymous" : userData?.username || "Anonymous",
          };
        })
      );

      setDonations(donationsWithUsers); // ✅ Now TypeScript knows the structure
    };

    fetchDonations(); // Initial fetch

    // ✅ Real-time listener for new donations
    const donationSubscription = supabase
      .channel("donations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donations" },
        async (payload) => {
          const newDonation = payload.new;

          // ✅ Fetch donor username from `users` table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("username")
            .eq("id", newDonation.id)
            .single();

          // ✅ Ensure all required properties exist
          const formattedDonation: Donation = {
            id: newDonation.id,
            amount: parseFloat(newDonation.amount || "0"),
            donation_date: newDonation.donation_date,
            guardian_id: newDonation.id,
            category: newDonation.category,
            username: userError ? "Anonymous" : userData?.username || "Anonymous",
          };

          setDonations((prev) => [formattedDonation, ...prev]); // ✅ Update UI with new donation
        }
      )
      .subscribe();

    return () => {
      donationSubscription.unsubscribe(); // ✅ Cleanup on component unmount
    };
  }, [category]); // ✅ Fetch data again if category changes

  return (
    <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#007BFF" }}>
        Recent Donations in {category}
      </Typography>

      {donations.map((donation) => (
        <Card
          key={donation.id}
          sx={{
            borderRadius: 2,
            boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
            padding: 2,
          }}
        >
          <CardContent
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
              {donation.username}
            </Typography>
            <Typography sx={{ fontSize: "1.2rem", color: "#007BFF" }}>
              ${donation.amount.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default DonationsFeed;



