import { useState } from "react";

export default function PlaceCard({ place, refresh }) {
    const token = localStorage.getItem("token");
    const [message, setMessage] = useState("");

    const approve = async () => {
        try {
            const res = await fetch(
                `http://localhost:8080/admin/provider-service/approve/${place._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            if (data.success) {
                setMessage("Approved");
                refresh();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const reject = async () => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        try {
            const res = await fetch(
                `http://localhost:8080/admin/provider-service/reject/${place._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reason }),
                }
            );

            const data = await res.json();
            if (data.success) {
                setMessage("Rejected");
                refresh();
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="border p-4 rounded shadow mb-4 flex gap-4">
            <div className="flex-1">

                {/* BASIC INFO */}
                <h2 className="text-xl font-bold">{place.name}</h2>
                <p className="text-sm text-gray-600">
                    Provider: {place.provider?.name} ({place.provider?.email})
                </p>

                <p><b>Category:</b> {place.category}</p>
                <p><b>Price:</b> ₹{place.pricing?.price}</p>
                <p>
                    <b>Location:</b> {place.location?.city}, {place.location?.state}
                </p>

                <p className="mt-1">
                    Status:{" "}
                    <span className="font-semibold capitalize">
                        {place.status}
                    </span>
                </p>

                {/* OPTIONAL MESSAGE */}
                {message && (
                    <p className="text-sm text-green-600 mt-1">{message}</p>
                )}

                {/* ACTION BUTTONS */}
                <div className="mt-3 flex gap-2">
                    {place.status !== "approved" && (
                        <button
                            onClick={approve}
                            className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                            Approve
                        </button>
                    )}

                    {place.status !== "rejected" && (
                        <button
                            onClick={reject}
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                            Reject
                        </button>
                    )}
                </div>

                {/* EXTRA DETAILS */}
                <div className="mt-3 text-sm text-gray-700">
                    <p><b>Address:</b> {place.location?.address}</p>
                    <p><b>Description:</b> {place.description}</p>
                    {place.contact?.phone && <p><b>Phone:</b> {place.contact.phone}</p>}

                    {place.rejectionReason && (
                        <p className="text-red-500 mt-1">
                            Reason: {place.rejectionReason}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}