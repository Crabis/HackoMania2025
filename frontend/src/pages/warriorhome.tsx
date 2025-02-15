import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, LinearProgress, TextField } from '@mui/material';
import MenuDrawer from "../components/navbar"
import supabase from '../services/supabaseClient'; // Ensure correct Supabase import

const WarriorHomePage = () => {
  const [user, setUser] = useState<any>(null);
  const [warriorData, setWarriorData] = useState<any[]>([]);
  const [goal, setGoal] = useState<number>(20); // Default goal is 20 weeks if column in supabase is empty
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);

      if (data?.user) {
        console.log('Fetched User ID:', data.user.id);
        const { data: warriorRecords, error } = await supabase
          .from('warriors')
          .select('addict_type, days_clean, goal_weeks')
          .eq('uuid', data.user.id);

        if (error) {
          console.error(error);
        } else {
          setWarriorData(warriorRecords || []);
          if (warriorRecords?.length > 0) {
            setGoal(warriorRecords[0]?.goal_weeks || 20);
          }
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
          days_clean: 0,
          goal_weeks: goal,
        });

      if (error) {
        console.error('Error adding new addiction type:', error);
      } else {
        const { data: updatedWarriorRecords } = await supabase
          .from('warriors')
          .select('addict_type, days_clean, goal_weeks')
          .eq('uuid', user.id);

        console.log('Updated warrior data:', updatedWarriorRecords);
        setWarriorData(updatedWarriorRecords || []);
      }
    }
  };

  const handleGoalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newGoal = Number(event.target.value);
    setGoal(newGoal);
  };

  return (
    
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5, px: 3 }}>
      <MenuDrawer />
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
        Welcome, Warrior! 🏆
      </Typography>

      <Typography variant="body1" sx={{ textAlign: 'center', mb: 3, color: 'gray' }}>
        Every step forward is a victory! Keep going! 🚀
      </Typography>

      {/* Goal Setting */}
      {}
      <Card sx={{ mb: 3, width: '100%', maxWidth: '500px', p: 2 }}>
        <CardContent>
          <Typography variant="h6">Set Your Personal Goal</Typography>
          <TextField
            type="number"
            label="Weeks Goal"
            value={goal}
            onChange={handleGoalChange}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>

      {/* Progress Bars for Addictions */}
      {warriorData.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 3 }}>No addiction data available.</Typography>
      ) : (
        warriorData.map((warrior, index) => {
          const weeksClean = Math.floor(warrior.days_clean / 7);
          const progress = Math.min((weeksClean / goal) * 100, 100); // Prevents exceeding 100%
          return (
            <Card key={index} sx={{ mb: 3, width: '100%', maxWidth: '500px', p: 2 }}>
              <CardContent>
                <Typography variant="h6">{warrior.addict_type} Addiction</Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ mt: 2, height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {weeksClean} / {goal} Weeks Clean ({progress.toFixed(1)}% Completed)
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: progress === 100 ? 'green' : 'blue' }}>
                  {progress === 100 ? '🎉 You reached your goal! Keep pushing forward! 🎉' : 'Stay strong, every day counts!'}
                </Typography>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Add New Addiction Type */}
      <Card sx={{ mb: 3, width: '100%', maxWidth: '500px', p: 2 }}>
        <CardContent>
          <Typography variant="h6">Add New Addiction Type</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ flex: 1, mx: 0.5 }}
              onClick={() => handleAddictTypeChange('Alcohol')}
            >
              Set as Alcohol
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ flex: 1, mx: 0.5 }}
              onClick={() => handleAddictTypeChange('Drugs')}
            >
              Set as Drugs
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ flex: 1, mx: 0.5 }}
              onClick={() => handleAddictTypeChange('Smoking')}
            >
              Set as Smoking
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WarriorHomePage;