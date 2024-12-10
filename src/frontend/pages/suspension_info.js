import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import "@fontsource/dm-sans"; 

const SuspensionPage = () => {
    const navigate = useNavigate();

    // Handle fine payment
    const handlePayFee = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/users/pay-fine", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Fine Payment successful:", data);
                alert("Your account has been successfully reactivated!");
                navigate("/user_profile"); // Redirect to user profile after payment
            } else {
                const error = await response.json();
                console.error("Error paying fine:", error.error);
                alert(error.error || "Failed to process the fine payment.");
            }
        } catch (err) {
            console.error("Server error during fine payment.", err.message);
            alert("Server error while processing your fine payment.");
        }
    };

    // Page content
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#f9f9f9",
            }}
        >
            <Box
                sx={{
                    width: "500px",
                    bgcolor: "background.paper",
                    border: "1px solid #000",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: "8px",
                    textAlign: "center",
                }}
            >
                <Typography variant="h5" component="h2">
                    Your Account is Suspended
                </Typography>
                <Typography sx={{ mt: 2, mb: 3 }}>
                    You cannot access your account until it is reactivated. To reactivate,
                    you can pay a $50 reactivation fee OR wait for a SuperUser to review your suspension.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePayFee}
                    sx={{ width: "100%", mb: 2 }}
                >
                    Pay $50 Reactivation Fee
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/")}
                    sx={{ width: "100%" }}
                >
                    Logout
                </Button>
            </Box>
        </div>
    );
};

export default SuspensionPage;
