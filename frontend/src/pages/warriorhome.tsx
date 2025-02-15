import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, LinearProgress, TextField } from '@mui/material';
import MenuDrawer from "../components/navbar"
import supabase from '../services/supabaseClient'; // Ensure correct Supabase import
import Logo from "frontend/public/images/logo.png";

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
      // Check if the addiction type already exists
      const alreadyExists = warriorData.some((warrior) => warrior.addict_type === newAddictType);
      
      if (alreadyExists) {
        console.log(`User already has ${newAddictType} in their records.`);
        return; // Prevent duplicate insertions
      }
  
      const { error } = await supabase
        .from('warriors')
        .insert({
          uuid: user.id,
          addict_type: newAddictType,
          days_clean: 0, // Start from 0 days clean
          goal_weeks: goal, // Store the currently set goal
          timestamp: new Date().toISOString(),
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

    const handleRemoveGoal = async (addictType: string) => {
    const { error } = await supabase
        .from('warriors')
        .delete()
        .match({ addict_type: addictType });
    
    if (error) {
        console.error('Error removing goal:', error.message);
        return;
    }

    // Update the UI by filtering out the removed goal
    setWarriorData((prevData) => prevData.filter((warrior) => warrior.addict_type !== addictType));
    };

  return (
    <>
      {/* Top Navigation Bar with MenuDrawer, Logo & Title */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: 2, 
        position: 'absolute', // Ensure it's at the top left
        top: 0,
        left: 0
      }}>
        <MenuDrawer />
        <img src={Logo} alt="BreakFree Logo" style={{ height: 40, marginLeft: 10 }} />
        <Typography variant="h6" sx={{ marginLeft: 1, fontWeight: 'bold', color: 'black' }}>
          BreakFree
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, px: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
          Welcome, Warrior! 🏆
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'center', mb: 3, color: 'gray' }}>
          Every step forward is a victory! Keep going! 🚀
        </Typography>

        {/* Goal Setting */}
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

        {/* Add New Addiction Type */}
        <Card sx={{ mb: 3, width: '100%', maxWidth: '500px', p: 2 }}>
        <CardContent>
            <Typography variant="h6">Add New Addiction Type</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            {['alcohol', 'drugs', 'smoking']
                .filter((type) => !warriorData.some((warrior) => warrior.addict_type === type))
                .map((type) => (
                <Button
                    key={type}
                    variant="contained"
                    color="primary"
                    sx={{ flex: 1, mx: 0.5 }}
                    onClick={() => handleAddictTypeChange(type)}
                >
                    Set as {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
            ))}
            </Box>
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
              <Button 
                variant="contained" 
                color="secondary" 
                sx={{ mt: 2 }}
                onClick={() => handleRemoveGoal(warrior.addict_type)}
              >
                Remove Goal
              </Button>
            </CardContent>
          </Card>
            );
          })
        )}
      </Box>
    </>
  );
};

export default WarriorHomePage;