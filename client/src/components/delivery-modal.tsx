import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onConfirm: (deliveryData: any) => void;
  isLoading: boolean;
}

export function DeliveryModal({ isOpen, onClose, order, onConfirm, isLoading }: DeliveryModalProps) {
  const [deliveryData, setDeliveryData] = useState({
    actualCost: order?.estimatedCost || '',
    deliveryNotes: '',
    storageLocation: '',
    receivedBy: '',
    itemCondition: 'good',
    deliveredItems: {
      proteins: order?.proteins || '',
      vegetables: order?.vegetables || '',
      fruits: order?.fruits || '',
      grains: order?.grains || '',
      snacks: order?.snacks || '',
      beverages: order?.beverages || '',
      supplements: order?.supplements || ''
    }
  });

  const handleSubmit = () => {
    onConfirm(deliveryData);
  };

  const updateDeliveredItem = (category: string, value: string) => {
    setDeliveryData(prev => ({
      ...prev,
      deliveredItems: {
        ...prev.deliveredItems,
        [category]: value
      }
    }));
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#DC143C]">
            Complete Delivery - {order.playerName}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Week: {order.weekStartDate} • Delivery Day: {order.deliveryDay}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(order).map(([key, value]) => {
                  if (['proteins', 'vegetables', 'fruits', 'grains', 'snacks', 'beverages', 'supplements'].includes(key) && value) {
                    return (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-sm capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-700">{value as string}</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              <div className="mt-4 flex gap-4">
                <Badge variant="outline">Estimated Cost: €{order.estimatedCost}</Badge>
                <Badge variant="secondary">{order.status}</Badge>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="actualCost">Actual Cost (€)</Label>
                  <Input
                    id="actualCost"
                    type="number"
                    step="0.01"
                    value={deliveryData.actualCost}
                    onChange={(e) => setDeliveryData(prev => ({ ...prev, actualCost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="storageLocation">Storage Location</Label>
                  <Select value={deliveryData.storageLocation} onValueChange={(value) => setDeliveryData(prev => ({ ...prev, storageLocation: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kitchen-pantry">Kitchen Pantry</SelectItem>
                      <SelectItem value="kitchen-refrigerator">Kitchen Refrigerator</SelectItem>
                      <SelectItem value="kitchen-freezer">Kitchen Freezer</SelectItem>
                      <SelectItem value="storage-room">Storage Room</SelectItem>
                      <SelectItem value="player-room">Player Room</SelectItem>
                      <SelectItem value="supplement-cabinet">Supplement Cabinet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="receivedBy">Received By</Label>
                  <Input
                    id="receivedBy"
                    value={deliveryData.receivedBy}
                    onChange={(e) => setDeliveryData(prev => ({ ...prev, receivedBy: e.target.value }))}
                    placeholder="Player name or staff member"
                  />
                </div>

                <div>
                  <Label htmlFor="itemCondition">Item Condition</Label>
                  <Select value={deliveryData.itemCondition} onValueChange={(value) => setDeliveryData(prev => ({ ...prev, itemCondition: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="missing_items">Missing Items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                  <Textarea
                    id="deliveryNotes"
                    value={deliveryData.deliveryNotes}
                    onChange={(e) => setDeliveryData(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                    placeholder="Any special notes about the delivery..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivered Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivered Items</CardTitle>
                <p className="text-sm text-gray-600">Adjust if different from original order</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(deliveryData.deliveredItems).map(([category, value]) => (
                  <div key={category}>
                    <Label htmlFor={`delivered-${category}`} className="capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Textarea
                      id={`delivered-${category}`}
                      value={value}
                      onChange={(e) => updateDeliveredItem(category, e.target.value)}
                      placeholder={`Enter ${category} delivered...`}
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Processing..." : "Complete Delivery"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}