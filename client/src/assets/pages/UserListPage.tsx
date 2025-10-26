import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";
import { Button } from "@components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Calendar } from "@components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Input } from "@components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useToast } from "@hooks/use-toast";
import { queryClient } from "@lib/queryClient";
import { me as useMe } from "@hooks/use-user";
import {
  MoreHorizontal,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  Trash2,
  Edit3,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import { Badge } from "@components/ui/badge";
import { format } from "date-fns";
import { cn } from "@lib/utils";
import { Pagination } from "@components/pagination";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  created_at: string;
  status: "active" | "disabled";
  expires_at?: string;
}

const ITEMS_PER_PAGE = 1000;

const UserListPage: React.FC = () => {
  const { toast } = useToast();
  const { data: currentUser } = useMe();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState<Date | undefined>(
    undefined
  );
  const [isBulkExpiryDialogOpen, setIsBulkExpiryDialogOpen] = useState(false);
  const [bulkNewExpiryDate, setBulkNewExpiryDate] = useState<
    Date | undefined
  >(undefined);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const selectAllCheckboxRef = React.useRef<HTMLInputElement>(null);

  const { data: users = [], isLoading: loading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const token =
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("auth_token");
      return apiRequest("GET", "/api/users", undefined, token);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const token =
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("auth_token");
      return apiRequest("DELETE", `/api/users/${userId}`, undefined, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: number;
      status: "active" | "disabled";
    }) => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const token =
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("auth_token");
      return apiRequest("PUT", `/api/users/${userId}/status`, { status }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      expires_at,
    }: {
      userId: number;
      expires_at: string | null;
    }) => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const token =
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("auth_token");
      return apiRequest("PUT", `/api/users/${userId}`, { expires_at }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User expiration date updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteUsersMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const token =
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("auth_token");
      return apiRequest("POST", `/api/users/bulk-delete`, { userIds }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Selected users deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUserIds([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete selected users.",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({
      userIds,
      status,
    }: {
      userIds: number[];
      status: "active" | "disabled";
    }) => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const token =
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("auth_token");
      return apiRequest(
        "POST",
        `/api/users/bulk-status-update`,
        { userIds, status },
        token
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Selected users' status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUserIds([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status for selected users.",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateExpiryMutation = useMutation({
    mutationFn: async ({
      userIds,
      expires_at,
    }: {
      userIds: number[];
      expires_at: string | null;
    }) => {
      const { apiRequest } = await import("@/assets/lib/queryClient");
      const token =
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("auth_token");
      return apiRequest(
        "POST",
        `/api/users/bulk-expiry-update`,
        { userIds, expires_at },
        token
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Selected users' expiration date updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUserIds([]);
      setIsBulkExpiryDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to update expiration date for selected users.",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users
    .filter((user) => {
      const query = search.toLowerCase();
      const matchText =
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.status === "active") ||
        (statusFilter === "disabled" && user.status === "disabled");

      return matchText && matchStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIdsOnPage = paginatedUsers
        .filter((user) => user.id !== currentUser?.id)
        .map((user) => user.id);
      setSelectedUserIds(allIdsOnPage);
    } else {
      setSelectedUserIds([]);
    }
  };

  React.useEffect(() => {
    setSelectedUserIds([]);
  }, [currentPage, statusFilter, search, sortOrder]);

  React.useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const numSelected = selectedUserIds.length;
      const numOnPage = paginatedUsers.filter(u => u.id !== currentUser?.id).length;
      selectAllCheckboxRef.current.checked =
        numSelected === numOnPage && numOnPage > 0;
      selectAllCheckboxRef.current.indeterminate =
        numSelected > 0 && numSelected < numOnPage;
    }
  }, [selectedUserIds, paginatedUsers, currentUser]);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600 mt-1 text-sm">
                Manage and view all registered users in the system
              </p>
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : users.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total registered users in the system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : users.filter(u => u.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Users with active accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disabled Users</CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : users.filter(u => u.status === 'disabled').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Users with disabled accounts
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle className="text-lg font-semibold">User List</CardTitle>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortOrder}
                      onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {selectedUserIds.length > 0 && (
                <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedUserIds.length} user(s) selected
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => bulkUpdateStatusMutation.mutate({ userIds: selectedUserIds, status: 'active' })} className="flex-grow sm:flex-grow-0">
                      <UserCheck className="h-4 w-4 mr-2" /> Enable
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => bulkUpdateStatusMutation.mutate({ userIds: selectedUserIds, status: 'disabled' })} className="flex-grow sm:flex-grow-0">
                      <UserX className="h-4 w-4 mr-2" /> Disable
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsBulkExpiryDialogOpen(true)} className="flex-grow sm:flex-grow-0">
                      <CalendarIcon className="h-4 w-4 mr-2" /> Set Expiry
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-grow sm:flex-grow-0">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the selected {selectedUserIds.length} user(s). This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => bulkDeleteUsersMutation.mutate(selectedUserIds)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={bulkDeleteUsersMutation.isPending}
                          >
                            {bulkDeleteUsersMutation.isPending ? "Deleting..." : "Delete Selected"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                    <UserX className="h-16 w-16" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-md border overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="p-4">
                            <div className="flex items-center">
                              <input
                                ref={selectAllCheckboxRef}
                                id="checkbox-all-search"
                                type="checkbox"
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expires
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedUsers.map((user, idx) => (
                          <tr key={user.id} className="hover:bg-gray-50/50">
                            <td className="w-4 p-4">
                              <div className="flex items-center">
                                <input
                                  id={`checkbox-table-search-${user.id}`}
                                  type="checkbox"
                                  checked={selectedUserIds.includes(user.id)}
                                  onChange={() => handleSelectUser(user.id)}
                                  disabled={currentUser?.id === user.id}
                                  className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <label htmlFor={`checkbox-table-search-${user.id}`} className="sr-only">checkbox</label>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="font-medium text-blue-800">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={user.status === "active" ? "default" : "secondary"}
                                className={user.status === "active" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                }
                              >
                                {user.status === "active" ? "Active" : "Disabled"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.expires_at
                                ? new Date(user.expires_at).toLocaleDateString()
                                : <span className="text-gray-400">N/A</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    disabled={currentUser?.id === user.id}
                                    onClick={() =>
                                      updateUserStatusMutation.mutate({
                                        userId: user.id,
                                        status: user.status === "active" ? "disabled" : "active",
                                      })
                                    }
                                  >
                                    {user.status === "active" ? (
                                      <>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Disable User
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Enable User
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={currentUser?.id === user.id}
                                    onSelect={() => {
                                      setSelectedUser(user);
                                      setNewExpiryDate(user.expires_at ? new Date(user.expires_at) : undefined);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    <span>Set Expiry Date</span>
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem 
                                        onSelect={(e) => e.preventDefault()}
                                        disabled={currentUser?.id === user.id}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete User
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the account of{" "}
                                          <span className="font-semibold">{user.firstName} {user.lastName}</span>.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteUserMutation.mutate(user.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete User
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-3">
                    {paginatedUsers.map((user) => (
                      <Card key={user.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center h-10 pt-1">
                            <input
                              id={`checkbox-mobile-${user.id}`}
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              disabled={currentUser?.id === user.id}
                              className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500 break-all">{user.email}</div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 -mt-1 -mr-2">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    disabled={currentUser?.id === user.id}
                                    onClick={() => updateUserStatusMutation.mutate({ userId: user.id, status: user.status === "active" ? "disabled" : "active" })}
                                  >
                                    {user.status === "active" ? <><UserX className="mr-2 h-4 w-4" />Disable</> : <><UserCheck className="mr-2 h-4 w-4" />Enable</>}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={currentUser?.id === user.id}
                                    onSelect={() => {
                                      setSelectedUser(user);
                                      setNewExpiryDate(user.expires_at ? new Date(user.expires_at) : undefined);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    <span>Set Expiry Date</span>
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={currentUser?.id === user.id} className="text-red-600 focus:text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete the account of <span className="font-semibold">{user.firstName} {user.lastName}</span>.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteUserMutation.mutate(user.id)} className="bg-red-600 hover:bg-red-700">
                                          Delete User
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                              <Badge variant={user.status === "active" ? "default" : "secondary"} className={cn("text-xs", user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                                {user.status === "active" ? "Active" : "Disabled"}
                              </Badge>
                              <div className="text-gray-500 text-right">
                                <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
                                <div>Expires: {user.expires_at ? new Date(user.expires_at).toLocaleDateString() : 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 px-2">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
                        </span> of{" "}
                        <span className="font-medium">{filteredUsers.length}</span> results
                      </div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        className="mt-0"
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Set Expiry Date for {selectedUser?.firstName}{" "}
              {selectedUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              Select a new expiration date for this user. Leave it blank to
              remove the expiration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newExpiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newExpiryDate ? (
                    format(newExpiryDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newExpiryDate}
                  onSelect={setNewExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewExpiryDate(undefined)}>Clear Date</Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  updateUserMutation.mutate({
                    userId: selectedUser.id,
                    expires_at: newExpiryDate ? format(newExpiryDate, 'yyyy-MM-dd') : null,
                  });
                }
              }}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isBulkExpiryDialogOpen}
        onOpenChange={setIsBulkExpiryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Set Expiry Date for {selectedUserIds.length} user(s)
            </DialogTitle>
            <DialogDescription>
              Select a new expiration date for the selected users. Leave it
              blank to remove the expiration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !bulkNewExpiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bulkNewExpiryDate ? (
                    format(bulkNewExpiryDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={bulkNewExpiryDate}
                  onSelect={setBulkNewExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkNewExpiryDate(undefined)}>Clear Date</Button>
            <Button
              onClick={() => {
                bulkUpdateExpiryMutation.mutate({ userIds: selectedUserIds, expires_at: bulkNewExpiryDate ? format(bulkNewExpiryDate, 'yyyy-MM-dd') : null });
              }}
              disabled={bulkUpdateExpiryMutation.isPending}
            > {bulkUpdateExpiryMutation.isPending ? "Saving..." : "Save for All"} </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserListPage;