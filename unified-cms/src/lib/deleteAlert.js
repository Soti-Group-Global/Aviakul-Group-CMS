import Swal from "sweetalert2";

export const confirmDelete = async (
  message = "Delete this item? This action cannot be undone.",
) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
};

// You can also create a generic alert function
export const showToast = (message, type = "success") => {
  Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    icon: type,
    title: message,
  });
};
