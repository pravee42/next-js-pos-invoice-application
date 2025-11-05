"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { apiClient } from "../../../lib/api";
import EmployeeForm from "../../../components/forms/EmployeeForm";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

export default function EmployeesPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getUsers();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await apiClient.updateUser(selectedUser._id, formData);
      } else {
        await apiClient.createUser(formData);
      }
      setShowForm(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert(error.response?.data?.message || "Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const data = await apiClient.deleteUser(id);
      if (data.success) {
        loadUsers();
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error.response?.data?.message || "Failed to delete employee");
    }
  };

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-accent">Employees</h1>
        <Button onClick={() => {
          setSelectedUser(null);
          setShowForm(true);
        }} className="text-sm px-3 py-2">
          <FiPlus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-sm text-muted">Loading employees...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted">No employees found</div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">{user.name || "N/A"}</h3>
                    <p className="text-xs text-muted mb-2">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary capitalize">
                        {user.role}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded capitalize ${
                          user.isActive
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                      className="h-8 w-8"
                    >
                      <FiEdit className="w-4 h-4" />
                    </Button>
                    {user.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user._id)}
                        className="h-8 w-8 text-error hover:text-error"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EmployeeForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedUser(null);
        }}
        onSubmit={handleSubmit}
        user={selectedUser}
        isLoading={isSubmitting}
      />
    </div>
  );
}

