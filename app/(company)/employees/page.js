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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-accent">Employees</h1>
        <Button onClick={() => {
          setSelectedUser(null);
          setShowForm(true);
        }}>
          <FiPlus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading employees...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-muted">No employees found</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {user.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-lg bg-primary/10 text-primary capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-lg capitalize ${
                            user.isActive
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                          >
                            <FiEdit className="w-4 h-4" />
                          </Button>
                          {user.role !== "owner" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(user._id)}
                              className="text-error hover:text-error"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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

