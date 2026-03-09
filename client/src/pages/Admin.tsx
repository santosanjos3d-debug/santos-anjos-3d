import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2, LogOut, Package, Tag, ExternalLink, RefreshCw,
  MapPin, Phone, User, Truck, CheckCircle2, Clock, XCircle, AlertCircle
} from 'lucide-react';
import { getLoginUrl } from '@/const';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Aguardando Pgto', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Clock size={12} /> },
  paid:       { label: 'Pago',            color: 'bg-blue-100 text-blue-800 border-blue-300',       icon: <CheckCircle2 size={12} /> },
  processing: { label: 'Em Preparo',      color: 'bg-purple-100 text-purple-800 border-purple-300', icon: <Package size={12} /> },
  shipped:    { label: 'Enviado',         color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: <Truck size={12} /> },
  completed:  { label: 'Concluído',       color: 'bg-green-100 text-green-800 border-green-300',    icon: <CheckCircle2 size={12} /> },
  cancelled:  { label: 'Cancelado',       color: 'bg-red-100 text-red-800 border-red-300',          icon: <XCircle size={12} /> },
};

export default function Admin() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [generatingLabel, setGeneratingLabel] = useState<number | null>(null);
  const [labelMessages, setLabelMessages] = useState<Record<number, { type: 'success' | 'error'; text: string }>>({});

  const ordersQuery = trpc.orders.list.useQuery(undefined, { refetchInterval: 30000 });
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => ordersQuery.refetch(),
  });
  const generateLabelMutation = trpc.orders.generateLabel.useMutation();

  const orders = ordersQuery.data || [];
  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(o => o.status === selectedStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Área Administrativa</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 text-sm">Faça login para acessar o painel de pedidos.</p>
            <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
              <a href={getLoginUrl()}>Entrar com Manus</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
  };

  const handleGenerateLabel = async (orderId: number) => {
    setGeneratingLabel(orderId);
    setLabelMessages(prev => ({ ...prev, [orderId]: undefined as any }));
    try {
      const result = await generateLabelMutation.mutateAsync({ orderId });
      if (result.labelUrl) {
        setLabelMessages(prev => ({
          ...prev,
          [orderId]: { type: 'success', text: 'Etiqueta gerada com sucesso!' },
        }));
        window.open(result.labelUrl, '_blank');
      } else {
        setLabelMessages(prev => ({
          ...prev,
          [orderId]: { type: 'success', text: result.message || 'Pedido de retirada — sem etiqueta.' },
        }));
      }
      ordersQuery.refetch();
    } catch (err: any) {
      setLabelMessages(prev => ({
        ...prev,
        [orderId]: { type: 'error', text: err.message || 'Erro ao gerar etiqueta' },
      }));
    } finally {
      setGeneratingLabel(null);
    }
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status as OrderStatus] = (acc[o.status as OrderStatus] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-amber-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Santos Anjos 3D — Admin</h1>
              <p className="text-xs text-gray-500">Gestão de Pedidos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-1">
              <LogOut size={14} /> Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Resumo de status */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status === selectedStatus ? 'all' : status)}
              className={`rounded-lg border p-3 text-center transition-all ${
                selectedStatus === status ? 'ring-2 ring-amber-500' : 'hover:shadow-sm'
              } ${STATUS_CONFIG[status].color}`}
            >
              <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
              <p className="text-xs mt-1">{STATUS_CONFIG[status].label}</p>
            </button>
          ))}
        </div>

        {/* Filtros + Refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">
              {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}
              {selectedStatus !== 'all' && ` — ${STATUS_CONFIG[selectedStatus].label}`}
            </span>
            {selectedStatus !== 'all' && (
              <button onClick={() => setSelectedStatus('all')} className="text-xs text-amber-600 underline">
                Ver todos
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => ordersQuery.refetch()}
            disabled={ordersQuery.isFetching}
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} className={ordersQuery.isFetching ? 'animate-spin' : ''} />
            Atualizar
          </Button>
        </div>

        {/* Lista de pedidos */}
        {ordersQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-amber-600" size={32} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const statusCfg = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.pending;
              const labelMsg = labelMessages[order.id];
              const isPickup = order.shippingServiceName === 'Retirada no Local';
              const hasAddress = order.addressPostalCode && order.addressStreet;
              const hasLabel = !!order.labelUrl;
              const canGenerateLabel = order.status !== 'cancelled' && hasAddress;

              let items: any[] = [];
              try { items = order.itemsSummary ? JSON.parse(order.itemsSummary) : []; } catch {}

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Cabeçalho do pedido */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${statusCfg.color}`}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                        {order.trackingCode && (
                          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-full">
                            📦 {order.trackingCode}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          R$ {parseFloat(String(order.totalPrice)).toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 grid sm:grid-cols-3 gap-4">
                      {/* Cliente */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                          <User size={12} /> Cliente
                        </p>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        {order.customerPhone && (
                          <a href={`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-green-600 flex items-center gap-1 hover:underline">
                            <Phone size={12} /> {order.customerPhone}
                          </a>
                        )}
                        {order.customerDocument && (
                          <p className="text-xs text-gray-500">CPF: {order.customerDocument}</p>
                        )}
                      </div>

                      {/* Endereço */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                          <MapPin size={12} /> Endereço
                        </p>
                        {hasAddress ? (
                          <>
                            <p className="text-sm text-gray-800">
                              {order.addressStreet}, {order.addressNumber}
                              {order.addressComplement && ` — ${order.addressComplement}`}
                            </p>
                            <p className="text-sm text-gray-600">{order.addressDistrict}</p>
                            <p className="text-sm text-gray-600">{order.addressCity}/{order.addressState}</p>
                            <p className="text-xs text-gray-500">CEP: {order.addressPostalCode}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Sem endereço</p>
                        )}
                      </div>

                      {/* Frete + Itens */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                            <Truck size={12} /> Frete
                          </p>
                          <p className="text-sm text-gray-800">
                            {isPickup ? '🏠 Retirada no Local' : `${order.shippingCompany} ${order.shippingServiceName}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            R$ {parseFloat(String(order.shippingCost || 0)).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        {items.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Itens</p>
                            {items.map((item: any, i: number) => (
                              <p key={i} className="text-xs text-gray-700">
                                {item.name} ({item.size}) x{item.qty} — {item.price}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="px-4 pb-4 flex flex-wrap items-center gap-2 border-t pt-3">
                      {/* Mudar status */}
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="text-xs border rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(s => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>

                      {/* Gerar / Ver etiqueta */}
                      {!isPickup && canGenerateLabel && (
                        hasLabel ? (
                          <a href={order.labelUrl!} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="flex items-center gap-1 border-green-500 text-green-700 hover:bg-green-50">
                              <Tag size={14} /> Ver Etiqueta
                              <ExternalLink size={12} />
                            </Button>
                          </a>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleGenerateLabel(order.id)}
                            disabled={generatingLabel === order.id}
                            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            {generatingLabel === order.id ? (
                              <><Loader2 size={14} className="animate-spin" /> Gerando...</>
                            ) : (
                              <><Tag size={14} /> Gerar Etiqueta</>
                            )}
                          </Button>
                        )
                      )}

                      {/* WhatsApp do cliente */}
                      {order.customerPhone && (
                        <a
                          href={`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${order.customerName}! Seu pedido *${order.orderNumber}* está ${STATUS_CONFIG[order.status as OrderStatus]?.label || order.status}.${order.trackingCode ? ` Código de rastreio: *${order.trackingCode}*` : ''}`)}`}
                          target="_blank" rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="flex items-center gap-1 text-green-700 border-green-400 hover:bg-green-50">
                            <Phone size={14} /> WhatsApp
                          </Button>
                        </a>
                      )}

                      {/* Mensagem de feedback da etiqueta */}
                      {labelMsg && (
                        <span className={`text-xs flex items-center gap-1 ${labelMsg.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                          {labelMsg.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {labelMsg.text}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
