import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, LinearProgress, TextField } from '@mui/material';
import MenuDrawer from "../components/navbar";
import supabase from '../services/supabaseClient';
import Logo from "frontend/public/images/logo.png";

// Define valid addiction types as an enum
enum AddictType {
  ALCOHOL = 'alcohol',
  DRUGS = 'drugs',
  SMOKING = 'smoking'
}

interface Warrior {
  addict_id?: number;
  uuid: string;
  addict_type: AddictType;
  days_clean: number;
  goal_weeks: number;
  username: string;
  timestamp: string;
}

interface UserData {
  username: string | null;
  role: string | null;
}

const WarriorHomePage = () => {
  const [warriorData, setWarriorData] = useState<Warrior[]>([]);
  const [goal, setGoal] = useState<number>(20);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          throw new Error('No authenticated user');
        }

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username, role')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        
        if (userData?.username) {
          setUsername(userData.username);
        }

        // Fetch warrior data
        const { data: warriorRecords, error: warriorError } = await supabase
          .from('warriors')
          .select('*')
          .eq('uuid', user.id);

        if (warriorError) throw warriorError;

        if (warriorRecords) {
          setWarriorData(warriorRecords);
          if (warriorRecords.length > 0) {
            setGoal(warriorRecords[0].goal_weeks);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, []);

  const handleAddictTypeChange = async (newAddictType: AddictType) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Get current username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      const currentUsername = userData?.username || '';

      // Check for existing record
      const { data: existingWarrior, error: checkError } = await supabase
        .from('warriors')
        .select('*')
        .eq('uuid', user.id)
        .eq('addict_type', newAddictType)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // Not found error is ok
        throw checkError;
      }

      const warriorData: Warrior = {
        uuid: user.id,
        addict_type: newAddictType,
        days_clean: 0,
        goal_weeks: goal,
        username: currentUsername,
        timestamp: new Date().toISOString()
      };

      let error;
      if (existingWarrior) {
        const { error: updateError } = await supabase
          .from('warriors')
          .update(warriorData)
          .eq('addict_id', existingWarrior.addict_id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('warriors')
          .insert([warriorData]);
        error = insertError;
      }

      if (error) throw error;

      // Refresh warrior data
      const { data: updatedRecords, error: fetchError } = await supabase
        .from('warriors')
        .select('*')
        .eq('uuid', user.id);

      if (fetchError) throw fetchError;
      
      if (updatedRecords) {
        setWarriorData(updatedRecords);
      }
    } catch (error) {
      console.error('Error updating addiction:', error);
      setError('Failed to update addiction data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newGoal = Number(event.target.value);
    if (newGoal > 0) {
      setGoal(newGoal);
    }
  };

  const handleRemoveGoal = async (addictType: AddictType) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('warriors')
        .delete()
        .match({ addict_type: addictType });
      
      if (error) throw error;

      // Update the UI by filtering out the removed goal
      setWarriorData((prevData) => prevData.filter((warrior) => warrior.addict_type !== addictType));
    } catch (error) {
      console.error('Error removing goal:', error);
      setError('Failed to remove addiction goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LinearProgress sx={{ width: '80%', maxWidth: '400px' }} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: 2, 
        position: 'absolute',
        top: 0,
        left: 0
      }}>
        <MenuDrawer />
        <img src={Logo} alt="BreakFree Logo" style={{ height: 40, marginLeft: 10 }} />
        <Typography variant="h6" sx={{ marginLeft: 1, fontWeight: 'bold', color: 'black' }}>
          BreakFree
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, px: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
          Welcome, {username || 'Warrior'}! 🏆
        </Typography>

        <Typography variant="body1" sx={{ textAlign: 'center', mb: 3, color: 'gray' }}>
          Every step forward is a victory! Keep going! 🚀
        </Typography>

        {error && (
          <Card sx={{ mb: 3, width: '100%', maxWidth: '500px', p: 2, bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography color="error">{error}</Typography>
            </CardContent>
          </Card>
        )}

        {/* Personal Goal Setting */}
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
              inputProps={{ min: 1 }}
            />
          </CardContent>
        </Card>

        {/* Add New Addiction Type */}
        <Card sx={{ mb: 3, width: '100%', maxWidth: '500px', p: 2 }}>
          <CardContent>
            <Typography variant="h6">Add New Addiction Type</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mt: 2 }}>
              {[AddictType.ALCOHOL, AddictType.DRUGS, AddictType.SMOKING]
                .filter((type) => !warriorData.some((warrior) => warrior.addict_type === type))
                .map((type) => (
                  <Button
                    key={type}
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleAddictTypeChange(type)}
                    disabled={loading}
                  >
                    Set as {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
            </Box>
          </CardContent>
        </Card>

        {/* Addiction Progress Cards */}
        {warriorData.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 3 }}>No addiction data available.</Typography>
        ) : (
          warriorData.map((warrior, index) => {
            const weeksClean = Math.floor(warrior.days_clean / 7);
            const progress = Math.min((weeksClean / goal) * 100, 100);
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
                    disabled={loading}
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