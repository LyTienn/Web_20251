import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/HeaderBar";

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, updateProfile } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        fullName: user ? user.fullName : "",
        dateOfBirth: user ? user.dateOfBirth : "",
        gender: user?.gender || "other",
        address: user ? user.address : "",
    })

    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    const handleUpdate = () => {
        
    }
}