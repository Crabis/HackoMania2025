import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Alert } from '@mui/material';
import MenuDrawer from "../components/navbar";
import supabase from '../services/supabaseClient';
import Logo from "frontend/public/images/logo.png";

interface BuddyWarrior {
  warrior_uuid: string;
  warrior_username: string;
  status: string;
  timestamp: string;
}

interface WarriorAddiction {
  addict_id: number;
  uuid: string;
  addict_type: string;
  days_clean: number;
  goal_weeks: number;
  username: string;
}

const ViewBuddyWarriors = () => {
  const [buddyWarriors, setBuddyWarriors] = useState<BuddyWarrior[]>([]);
  const [warriorAddictions, setWarriorAddictions] = useState<{ [key: string]: WarriorAddiction[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuddyWarriors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Not authenticated');

        // Fetch all warriors where the current user is a buddy
        const { data: buddies, error: buddyError } = await supabase
          .from('buddies')
          .select('warrior_uuid, warrior_username, status, timestamp')
          .eq('buddy_uuid', user.id)
          .eq('status', 'active')
          .order('timestamp', { ascending: false });

        if (buddyError) throw buddyError;

        if (!buddies) {
          setBuddyWarriors([]);
          return;
        }

        setBuddyWarriors(buddies);

        // Fetch addiction data for each warrior
        const addictionData: { [key: string]: WarriorAddiction[] } = {};
        
        for (const buddy of buddies) {
          const { data: addictions, error: addictError } = await supabase
            .from('warriors')
            .select('*')
            .eq('uuid', buddy.warrior_uuid);

          if (addictError) throw addictError;
          
          if (addictions) {
            addictionData[buddy.warrior_uuid] = addictions;
          }
        }

        setWarriorAddictions(addictionData);
      } catch (err) {
        console.error('Error fetching buddy warriors:', err);
        setError('Failed to load buddy warriors');
      } finally {
        setLoading(false);
      }
    };

    fetchBuddyWarriors();
  }, []);

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

      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 10, p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          My Warriors
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {buddyWarriors.length === 0 ? (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1" textAlign="center">
                You are not currently supporting any warriors. 
                Register as a buddy to start supporting someone's journey!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          buddyWarriors.map((warrior) => (
            <Card key={warrior.warrior_uuid} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {warrior.warrior_username}'s Journey
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Supporting since: {new Date(warrior.timestamp).toLocaleDateString()}
                </Typography>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Current Battles:
                </Typography>
                
                {warriorAddictions[warrior.warrior_uuid]?.length > 0 ? (
                  warriorAddictions[warrior.warrior_uuid].map((addiction) => {
                    const weeksClean = Math.floor(addiction.days_clean / 7);
                    const progress = Math.min((weeksClean / addiction.goal_weeks) * 100, 100);
                    
                    return (
                      <Box key={addiction.addict_id} sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          • {addiction.addict_type.charAt(0).toUpperCase() + addiction.addict_type.slice(1)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ mt: 1, mb: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {addiction.days_clean} days clean (Goal: {addiction.goal_weeks} weeks)
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No active recovery goals set
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </>
  );
};

export default ViewBuddyWarriors;