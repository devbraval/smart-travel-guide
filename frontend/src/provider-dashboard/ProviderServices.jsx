import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import ProviderAddNewPlace from './ProviderAddNewPlace';

export default function ProviderServices() {
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  const fetchingPlace = async () => {
    try {
      const res = await fetch("http://localhost:8080/provider/myservices", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setServices(data.result);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchingPlace();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`http://localhost:8080/provider/service/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setServices(services.filter(s => s._id !== id));
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.log(err);
      alert("Error deleting service");
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setIsAddingService(true);
  };

  const handleCancel = (shouldRefresh = false) => {
    setIsAddingService(false);
    setEditingService(null);
    if (shouldRefresh) {
      fetchingPlace();
    }
  };

  if (isAddingService) {
    return <ProviderAddNewPlace onCancel={handleCancel} initialData={editingService} />;
  }

  const approvedServices = services.filter((service) => service.status === "approved");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Services</h1>
          <p className="text-gray-500 mt-1">Manage and update your active listings.</p>
        </div>
        <button
          onClick={() => setIsAddingService(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add New Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {approvedServices.length === 0 ? (
          <p className="text-gray-500 col-span-full">No approved services found yet.</p>
        ) : (
          approvedServices.map((service) => (
            <div key={service._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group">
              <div 
                className="h-48 overflow-hidden relative cursor-pointer"
                onClick={() => navigate(`/place/${service._id}`)}
              >
                <img
                  src={service.images?.cover || service.images?.gallery?.[0] || 'https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-sm font-bold text-gray-800">
                  ₹{service.pricing?.price}
                </div>
              </div>
              <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{service.description}</p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-blue-100 text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded-xl font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-sm" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(service._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-100 text-red-600 bg-red-50/50 hover:bg-red-50 rounded-xl font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
