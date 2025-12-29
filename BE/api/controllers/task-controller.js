import { Task } from '../models/index.js';

export const getTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            id: task.id,
            status: task.status,
            result: task.result,
            error: task.error,
            progress: task.progress,
            type: task.type
        });
    } catch (error) {
        console.error("Error fetching task status:", error);
        res.status(500).json({ message: "Failed to fetch task status", error: error.message });
    }
};
