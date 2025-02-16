import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Button } from '@mui/material';
import supabase from '../services/supabaseClient';
import MenuDrawer from '../components/navbar';

const ManageWarriorsPage = () => {
    const [warriors, setWarriors] = useState<{ id: any; username: any; warrior_points: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchWarriors = async () => {
            setIsLoading(true);

            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData?.user) {
                setIsLoading(false);
                return;
            }
            setUser(authData.user);

            // Get mentor's session IDs
            const { data: sessions, error: sessionsError } = await supabase
                .from('sessions')
                .select('session_id')
                .eq('mentor_id', authData.user.id);

            if (sessionsError || !sessions.length) {
                setIsLoading(false);
                return;
            }

            const sessionIds = sessions.map(session => session.session_id);

            // Get warrior IDs from attendance
            const { data: attendance, error: attendanceError } = await supabase
                .from('attendance')
                .select('warrior_id')
                .in('session_id', sessionIds);

            if (attendanceError || !attendance.length) {
                setIsLoading(false);
                return;
            }

            const warriorIds = attendance.map(entry => entry.warrior_id);

            // Get warrior details
            const { data: warriorsData, error: warriorsError } = await supabase
                .from('users')
                .select('id, username, warrior_points')
                .in('id', warriorIds);

            if (!warriorsError && warriorsData) {
                setWarriors(warriorsData);
            }
            setIsLoading(false);
        };

        fetchWarriors();
    }, []);

    
    const handleMarkWarrior = async (warriorId: any, currentPoints: number) => {
        try {
            console.log("Fetching warrior data for ID:", warriorId);
    
            // Fetch warrior records
            const { data: warriorData, error: warriorError } = await supabase
                .from('warriors')
                .select('uuid, days_clean, timestamp')
                .eq('uuid', warriorId);
    
            console.log("Fetched warriorData:", warriorData);
    
            if (warriorError) {
                console.error("Supabase Error:", warriorError);
                return;
            }
    
            if (!warriorData || warriorData.length === 0) {
                console.error("No warrior data found for ID:", warriorId);
                return;
            }
    
            let totalAdditionalPoints = 0;
            const currentDate = new Date().toISOString();
    
            // Update each warrior entry separately
            for (const warrior of warriorData) {
                console.log("Processing warrior:", warrior);
    
                const lastCleanDate = new Date(warrior.timestamp);
                const daysSinceLastUpdate = Math.floor(
                    (new Date().getTime() - lastCleanDate.getTime()) / (1000 * 60 * 60 * 24)
                );
    
                console.log(`Warrior ID: ${warrior.uuid} | Last Clean Date: ${lastCleanDate} | Days Since Last Update: ${daysSinceLastUpdate}`);
    
                // Compute new days_clean value
                const newDaysClean = warrior.days_clean + daysSinceLastUpdate;
                console.log("New days clean:", newDaysClean);
    
                // Update this specific warrior entry immediately
                const { error: updateError } = await supabase
                    .from('warriors')
                    .update({ days_clean: newDaysClean})
                    .eq('uuid', warrior.uuid);
    
                if (updateError) {
                    console.error("Error updating warrior entry:", updateError);
                } else {
                    totalAdditionalPoints += daysSinceLastUpdate;
                }
            }
    
            console.log("Total additional points:", totalAdditionalPoints);
    
            // Update warrior_points in `users` table
            const newTotalPoints = currentPoints + 5 + totalAdditionalPoints;
            console.log("New total points for user:", newTotalPoints);
    
            const { error: userUpdateError } = await supabase
                .from('users')
                .update({ warrior_points: newTotalPoints })
                .eq('id', warriorId);
    
            if (userUpdateError) {
                console.error("Error updating warrior points in users table:", userUpdateError);
                return;
            }
    
            console.log("Successfully updated warrior points!");
    
            // Update UI state
            setWarriors(prevWarriors =>
                prevWarriors.map(warrior =>
                    warrior.id === warriorId ? { ...warrior, warrior_points: newTotalPoints } : warrior
                )
            );
    
        } catch (error) {
            console.error("Unexpected error:", error);
        }
    };
    

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
                <MenuDrawer />
                <Typography variant="h6" sx={{ marginLeft: 2, fontWeight: 'bold' }}>
                    Manage Warriors
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5, px: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
                    Your Warriors
                </Typography>

                {isLoading ? (
                    <CircularProgress />
                ) : warriors.length === 0 ? (
                    <Typography variant="body1" sx={{ textAlign: 'center', color: 'gray' }}>
                        No warriors found.
                    </Typography>
                ) : (
                    warriors.map((warrior) => (
                        <Card key={warrior.id} sx={{ mb: 2, width: '100%', maxWidth: '600px', p: 2 }}>
                            <CardContent>
                                <Typography variant="h6">{warrior.username}</Typography>
                                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                    Points: {warrior.warrior_points}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                    onClick={() => handleMarkWarrior(warrior.id, warrior.warrior_points)}
                                >
                                    Mark Warrior (+5 Points)
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </>
    );
};

export default ManageWarriorsPage;
