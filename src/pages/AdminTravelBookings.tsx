import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  Plane
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

// Types
interface TravelBooking {
  id: string;
  userId: string;
  userName: string;
  fromDestination: string;
  toDestination: string;
  travelType: 'Bus' | 'Car' | 'Flight' | 'Train';
  bookingPlatform: string;
  bookingDateTime: string;
  amountPaid: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  isActive: boolean;
}

// Mock data
const mockTravelBookings: TravelBooking[] = [
  { id: '1', userId: 'USR001', userName: 'Amit Sharma', fromDestination: 'Mumbai', toDestination: 'Delhi', travelType: 'Flight', bookingPlatform: 'Skyscanner', bookingDateTime: '2024-01-15T10:30:00', amountPaid: 8500, status: 'Confirmed', isActive: true },
  { id: '2', userId: 'USR002', userName: 'Priya Patel', fromDestination: 'Bangalore', toDestination: 'Chennai', travelType: 'Bus', bookingPlatform: 'RedBus', bookingDateTime: '2024-01-14T14:20:00', amountPaid: 950, status: 'Confirmed', isActive: true },
  { id: '3', userId: 'USR003', userName: 'Rahul Singh', fromDestination: 'Delhi', toDestination: 'Jaipur', travelType: 'Car', bookingPlatform: 'Uber', bookingDateTime: '2024-01-16T08:15:00', amountPaid: 2200, status: 'Pending', isActive: true },
  { id: '4', userId: 'USR004', userName: 'Sneha Reddy', fromDestination: 'Hyderabad', toDestination: 'Pune', travelType: 'Train', bookingPlatform: 'MakeMyTrip', bookingDateTime: '2024-01-13T06:45:00', amountPaid: 1500, status: 'Confirmed', isActive: false },
];

export const AdminTravelBookings: React.FC = () => {
  const [travelBookings, setTravelBookings] = useState<TravelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [travelTypeFilter, setTravelTypeFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'bookingDateTime' | 'amountPaid' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchTravelBookings = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setTravelBookings(mockTravelBookings);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch travel bookings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTravelBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return travelBookings
      .filter(b => {
        const matchesSearch = b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              b.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              b.fromDestination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              b.toDestination.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !travelTypeFilter || b.travelType === travelTypeFilter;
        const matchesPlatform = !platformFilter || b.bookingPlatform === platformFilter;
        const matchesActive = !activeOnlyFilter || b.isActive;
        return matchesSearch && matchesType && matchesPlatform && matchesActive;
      })
      .sort((a, b) => {
        if (!sortBy) return 0;
        let comparison = 0;
        if (sortBy === 'bookingDateTime') {
          comparison = new Date(a.bookingDateTime).getTime() - new Date(b.bookingDateTime).getTime();
        } else if (sortBy === 'amountPaid') {
          comparison = a.amountPaid - b.amountPaid;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [travelBookings, searchQuery, travelTypeFilter, platformFilter, activeOnlyFilter, sortBy, sortOrder]);

  const handleSort = (column: 'bookingDateTime' | 'amountPaid') => {
    if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleStatusToggle = (id: string, status: boolean) => {
    setTravelBookings(prev => prev.map(b => b.id === id ? { ...b, isActive: status } : b));
    toast({ title: 'Status Updated', description: `Booking is now ${status ? 'active' : 'inactive'}` });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTravelTypeFilter('');
    setPlatformFilter('');
    setActiveOnlyFilter(false);
    setSortBy('');
  };

  const formatDateTime = (dateTime: string) => new Date(dateTime).toLocaleString('en-IN', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  const formatAmount = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Confirmed': 'bg-success-color/10 text-success-color',
      'Pending': 'bg-warning-color/10 text-warning-color',
      'Cancelled': 'bg-error-color/10 text-error-color'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="Travel Bookings">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5"/> Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input placeholder="Search by name, ID, from/to..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <Input placeholder="Filter by travel type" value={travelTypeFilter} onChange={e => setTravelTypeFilter(e.target.value)} />
              <Input placeholder="Filter by platform" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} />
              <div className="flex items-center space-x-2">
                <Switch checked={activeOnlyFilter} onCheckedChange={setActiveOnlyFilter} />
                <label className="text-sm">Active Only</label>
              </div>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          {/* <CardHeader>
            <CardTitle>Travel Bookings List</CardTitle>
          </CardHeader> */}
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name/ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Travel Type</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead onClick={() => handleSort('bookingDateTime')} className="cursor-pointer">Booking Date & Time {sortBy==='bookingDateTime'?sortOrder==='asc'?'↑':'↓':''}</TableHead>
                  <TableHead onClick={() => handleSort('amountPaid')} className="cursor-pointer">Amount {sortBy==='amountPaid'?sortOrder==='asc'?'↑':'↓':''}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8">No bookings found</TableCell></TableRow>
                ) : (
                  filteredBookings.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>{b.userName} <div className="text-xs text-muted-foreground">{b.userId}</div></TableCell>
                      <TableCell>{b.fromDestination}</TableCell>
                      <TableCell>{b.toDestination}</TableCell>
                      <TableCell>{b.travelType}</TableCell>
                      <TableCell>{b.bookingPlatform}</TableCell>
                      <TableCell>{formatDateTime(b.bookingDateTime)}</TableCell>
                                           <TableCell>{formatAmount(b.amountPaid)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch checked={b.isActive} onCheckedChange={(val) => handleStatusToggle(b.id, val)} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => toast({ title: 'View Booking', description: `Viewing booking of ${b.userName}` })}>
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: 'Edit Booking', description: `Editing booking of ${b.userName}` })}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTravelBookings(prev => prev.filter(tb => tb.id !== b.id))}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};



// export default AdminTravelBookings;