import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, LinearProgress } from '@mui/material';
import supabase from '../services/supabaseClient'; // Make sure to import your supabase instance

const WarriorHomePage = () => {
  const [user, setUser] = useState<any>(null);
  const [warriorData, setWarriorData] = useState<any[]>([]); // Store warrior data (multiple addictions)
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user information when the component mounts
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);

      // Fetch all warrior records (addict_type, days_clean) for this user
      if (data?.user) {
        console.log('Fetched User ID:', data.user.id);
        const { data: warriorRecords, error } = await supabase
          .from('warriors')
          .select('addict_type, days_clean')
          .eq('uuid', data.user.id);

        if (error) {
          console.error(error);
        } else {
          setWarriorData(warriorRecords || []);
        }
      }
    };

    fetchUser();
  }, []);

  const handleAddictTypeChange = async (newAddictType: string) => {
    if (user) {
      const { error } = await supabase
        .from('warriors')
        .upsert({
          uuid: user.id,
          addict_type: newAddictType,
          days_clean: 0, // Default days_clean as 0 for new addictions
        });

      if (error) {
        console.error('Error adding new addiction type:', error);
      } else {
        // Fetch updated warrior data
        const { data: updatedWarriorRecords } = await supabase
          .from('warriors')
          .select('addict_type, days_clean')
          .eq('uuid', user.id);

        console.log("Updated warrior data:", updatedWarriorRecords); // Log updated data to console
        setWarriorData(updatedWarriorRecords || []);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
      <Typography variant="h5">Welcome, Warrior!</Typography>

      {/* Display progress bars for each addiction type */}
      {warriorData.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 3 }}>No addiction data available.</Typography>
      ) : (
        warriorData.map((warrior, index) => {
          const weeksClean = Math.floor(warrior.days_clean / 7); // Convert days_clean to weeks
          const warriorPoints = Math.min(weeksClean, 20); // Ensure points don't exceed 20 weeks

          return (
            <Card key={index} sx={{ mt: 3, width: '100%', maxWidth: '500px' }}>
              <CardContent>
                <Typography variant="h6">{warrior.addict_type} addiction</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(warriorPoints / 20) * 100}
                  sx={{ mt: 2 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {warriorPoints} / 20 Weeks Clean
                </Typography>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Option to add a new addiction type */}
      <Card sx={{ mt: 3, width: '100%', maxWidth: '500px' }}>
        <CardContent>
          <Typography variant="h6">Add New Addiction Type</Typography>
          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={() => handleAddictTypeChange('Alcohol')}
          >
            Set as Alcohol
          </Button>
          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={() => handleAddictTypeChange('Drugs')}
          >
            Set as Drugs
          </Button>
          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={() => handleAddictTypeChange('Smoking')}
          >
            Set as Smoking
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WarriorHomePage;
