import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useDeleteUserMutation } from '../../../slices/member/usersApiSlice'
import Notification from '../Notification';

const DeleteMemberDialog = ({ open, memberToDelete, onClose }) => {

    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();


    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success", // success | error | warning | info
    });

    const showNotification = (message, severity = "success") => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const closeNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    const confirmDeleteMember = async () => {
        try {
            await deleteUser(memberToDelete).unwrap();
            showNotification("Member deleted successfully.", "success");
            onClose()
        } catch (err) {
            Notification(err?.data?.message || err.error, "error")
        }
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Member</DialogTitle>

                <DialogContent dividers>
                    <Typography>
                        Are you sure you want to delete the member{" "}
                        <strong>{memberToDelete?.name}</strong>?
                    </Typography>

                    <Typography
                        variant="body2"
                        color="error"
                        mt={2}
                    >
                        This action cannot be undone.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDeleteMember}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Notification {...notification} onClose={closeNotification} />
        </>
    )
}

export default DeleteMemberDialog