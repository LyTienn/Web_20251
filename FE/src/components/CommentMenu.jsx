import { MoreVertical } from "lucide-react";
import { useState } from "react";

const CommentMenu = ({ commentId, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}>
        <MoreVertical className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white border rounded shadow z-10">
          <button className="block w-full px-4 py-2 text-left hover:bg-gray-100" onClick={() => { setOpen(false); onEdit(commentId); }}>Sửa</button>
          <button className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600" onClick={() => { setOpen(false); onDelete(commentId); }}>Xóa</button>
        </div>
      )}
    </div>
  );
}

export default CommentMenu;