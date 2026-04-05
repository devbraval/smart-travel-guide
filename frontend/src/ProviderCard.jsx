import { useState } from "react";
export default function ProviderCard({ user, refresh }) {
    const token = localStorage.getItem("token");
    const [selected, setSelected] = useState(null);
    const [message, setMessage] = useState("");
    const approve = async () => {
        const res = await fetch(`http://localhost:8080/admin/provider/${user._id}/approve`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        if (data.success) {
            setMessage("Provider approved successfully");
            refresh();
        }

    }
    const reject = async () => {
      const reason = prompt("Enter rejection reason:");
      if (!reason) return;
        const res = await fetch(`http://localhost:8080/admin/provider/${user._id}/reject`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
        });
        const data = await res.json();
        if (data.success) {
            setMessage("Provider rejected successfully");
            refresh();
        }
    }
    return (
    <>
      {/* CARD */}
      <div className="border p-4 rounded shadow mb-4 flex gap-4">

        <div className="flex-1">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p>{user.email}</p>

          <p><b>Business:</b> {user.providerInfo?.businessName}</p>
          <p><b>Type:</b> {user.providerInfo?.serviceType}</p>
          <p><b>Location:</b> {user.providerInfo?.district}, {user.providerInfo?.state}</p>

          <p>Status: <b>{user.providerStatus}</b></p>

          <div className="mt-3 flex gap-2">

            <button
              onClick={() => setSelected(user)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              View
            </button>

            {user.providerStatus === "pending" && (
              <>
                <button onClick={approve} className="bg-green-500 px-3 py-1 text-white rounded">✔</button>
                <button onClick={reject} className="bg-yellow-500 px-3 py-1 text-white rounded">✖</button>
              </>
            )}

            {user.providerStatus === "approved" && (
              <button onClick={reject} className="bg-yellow-500 px-3 py-1 text-white rounded">
                Reject
              </button>
            )}

            {user.providerStatus === "rejected" && (
              <button onClick={approve} className="bg-green-500 px-3 py-1 text-white rounded">
                Approve
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">{selected.name}</h2>

            <p><b>Email:</b> {selected.email}</p>
            <p><b>Business:</b> {selected.providerInfo?.businessName}</p>
            <p><b>Contact:</b> {selected.providerInfo?.contactNumber}</p>
            <p><b>Type:</b> {selected.providerInfo?.serviceType}</p>
            <p><b>State:</b> {selected.providerInfo?.state}</p>
            <p><b>District:</b> {selected.providerInfo?.district}</p>
            <p><b>Address:</b> {selected.providerInfo?.address}</p>
            <p><b>Properties:</b> {selected.providerInfo?.propertyCount}</p>
            <p><b>Description:</b> {selected.providerInfo?.description}</p>

            {selected.providerInfo?.rejectionReason && (
              <p className="text-red-500 mt-2">
                Reason: {selected.providerInfo.rejectionReason}
              </p>
            )}

            <button
              className="mt-4 bg-gray-600 text-white px-3 py-1 rounded"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
    );
}