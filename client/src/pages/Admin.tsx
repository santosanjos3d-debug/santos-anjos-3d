import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, LogOut, Filter } from 'lucide-react';
import { getLoginUrl } from '@/const';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  productId: number;
  quantity: number;
  totalPrice: string;
  pixKey: string;
  status: string;
  paymentId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function Admin() {
  const { user, logout, isAuthenticated } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  const ordersQuery = trpc.orders.list.useQuery();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();

  // Buscar pedidos
  useEffect(() => {
    if (ordersQuery.data) {
      const ordersData = ordersQuery.data.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      }));
      setOrders(ordersData);
    }
  }, [ordersQuery.data]);

  // Filtrar pedidos por status
  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  }, [orders, selectedStatus]);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus,
      });
      // Atualizar lista local
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      processing: 'Processando',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">
            Você precisa estar autenticado para acessar o painel de administração.
          </p>
          <a href={getLoginUrl()}>
            <Button className="w-full bg-accent hover:bg-accent/90">
              Fazer Login
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel de Administração</h1>
            <p className="text-sm text-muted-foreground">Santos Anjos 3D</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total de Pedidos</p>
            <p className="text-3xl font-bold text-foreground">{orders.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Pagos</p>
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'paid').length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Concluídos</p>
            <p className="text-3xl font-bold text-green-600">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Button
            onClick={() => setSelectedStatus('all')}
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            Todos ({orders.length})
          </Button>
          <Button
            onClick={() => setSelectedStatus('pending')}
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            className={selectedStatus === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            Pendentes ({orders.filter(o => o.status === 'pending').length})
          </Button>
          <Button
            onClick={() => setSelectedStatus('paid')}
            variant={selectedStatus === 'paid' ? 'default' : 'outline'}
            size="sm"
            className={selectedStatus === 'paid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Pagos ({orders.filter(o => o.status === 'paid').length})
          </Button>
          <Button
            onClick={() => setSelectedStatus('processing')}
            variant={selectedStatus === 'processing' ? 'default' : 'outline'}
            size="sm"
            className={selectedStatus === 'processing' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            Processando ({orders.filter(o => o.status === 'processing').length})
          </Button>
          <Button
            onClick={() => setSelectedStatus('completed')}
            variant={selectedStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            className={selectedStatus === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Concluídos ({orders.filter(o => o.status === 'completed').length})
          </Button>
        </div>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          {ordersQuery.isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Carregando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Número</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cliente</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Contato</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Quantidade</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Valor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Data</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-foreground">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{order.customerName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="space-y-1">
                          {order.customerEmail && <div>{order.customerEmail}</div>}
                          {order.customerPhone && <div>{order.customerPhone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{order.quantity}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-accent">R$ {order.totalPrice}</td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {order.createdAt.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={updateStatusMutation.isPending}
                          className="text-sm px-2 py-1 rounded border border-border bg-background text-foreground cursor-pointer hover:bg-secondary disabled:opacity-50"
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                          <option value="processing">Processando</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
