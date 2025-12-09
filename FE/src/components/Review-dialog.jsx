import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star, StarHalf, MessageCircle } from "lucide-react";
import axios from "@/config/Axios-config";

const ReviewDialog = ({ bookId, userId, userName, onReviewAdded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);

}

export default ReviewDialog;