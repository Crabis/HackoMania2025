import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase
const supabase = createClient(
  "https://qagsbbilljqjmauhylgo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3NiYmlsbGpxam1hdWh5bGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTczNzAsImV4cCI6MjA1NTE3MzM3MH0.5R8oQ9Zh_w6R7cDDhAU9xKZlMOk2jU3cCgO72uu91qU"
);

// ✅ Define the `Donation` type
interface Donation {
  id: string;
  amount: number;
  donation_date: string;
  guardian_id: string;
  category: string;
  username: string;
}

// ✅ Define the component
const DonationsFeed: React.FC<{ category: string }> = ({ category }) => {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Track loading state

  useEffect(() => {
    let isMounted = true; // ✅ Prevent state updates if component unmounts

    // ✅ Reset state when category changes
    setDonation(null);
    setLoading(true);

    const fetchDonation = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("id, amount, donation_date, guardian_id, category")
        .eq("category", category)
        .order("donation_date", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        if (isMounted) {
          setDonation(null);
          setLoading(false);
        }
        return;
      }

      // ✅ Fetch donor username
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("username")
        .eq("id", data.guardian_id)
        .single();

      if (isMounted) {
        setDonation({
          ...data,
          username: userError ? "Anonymous" : userData?.username || "Anonymous",
        });
        setLoading(false);
      }
    };

    fetchDonation();

    // ✅ Real-time listener for new donations
    const donationSubscription = supabase
      .channel("donations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donations" },
        async (payload) => {
          const newDonation = payload.new;

          // ✅ Fetch donor username
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("username")
            .eq("id", newDonation.guardian_id)
            .single();

          if (isMounted) {
            setDonation({
              id: newDonation.id,
              amount: parseFloat(newDonation.amount || "0"),
              donation_date: newDonation.donation_date,
              guardian_id: newDonation.guardian_id,
              category: newDonation.category,
              username: userError ? "Anonymous" : userData?.username || "Anonymous",
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false; // ✅ Prevent state updates after unmount
      donationSubscription.unsubscribe();
    };
  }, [category]); // ✅ Depend on category changes

  return (
    <div style={{ marginTop: "16px", padding: "0 16px" }}>
      {/* ✅ Left-Aligned Title */}
      <h3 style={{ fontWeight: "bold", color: "#000000", textAlign: "left" }}>
        Most Recent Donation in {category}:
      </h3>
  
      {/* ✅ Centered Donation Message */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        flexDirection: "column", 
        height: "20vh", // Adjust height to center message
        textAlign: "center" // Ensures text is centered
      }}>
        {loading ? (
          <p style={{ fontSize: "2rem", color: "#777" }}>Loading...</p>
        ) : donation ? (
          <p style={{ fontSize: "2rem", color: "#000", fontWeight: "bold" }}>
            {donation.username} has just donated ${donation.amount.toFixed(2)}!
          </p>
        ) : (
          <p style={{ fontSize: "1.5rem", color: "#777" }}>
            No recent donations yet.
          </p>
        )}
      </div>
    </div>
  );  
};

export default DonationsFeed;





