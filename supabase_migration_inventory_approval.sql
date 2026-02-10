-- RPC to Approve Inventory Request
CREATE OR REPLACE FUNCTION approve_inventory_request(p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product_id uuid;
  v_qty int;
  v_current_status text;
BEGIN
  -- 1. Get request details
  SELECT product_id, quantity, status 
  INTO v_product_id, v_qty, v_current_status
  FROM inventory_requests 
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Solicitud no encontrada');
  END IF;

  IF v_current_status <> 'pending' THEN
    RETURN json_build_object('success', false, 'message', 'La solicitud ya fue procesada');
  END IF;

  -- 2. Update Product Stock
  -- Note: quantity is negative for sales, so we add it directly
  UPDATE products 
  SET stock = stock + v_qty, updated_at = now()
  WHERE id = v_product_id;

  -- 3. Update Request Status
  UPDATE inventory_requests
  SET status = 'approved', admin_notes = 'Approved by Admin Dashboard'
  WHERE id = p_request_id;

  RETURN json_build_object('success', true, 'message', 'Solicitud aprobada y stock actualizado');
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- RPC to Reject Inventory Request
CREATE OR REPLACE FUNCTION reject_inventory_request(p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE inventory_requests
  SET status = 'rejected', admin_notes = 'Rejected by Admin Dashboard'
  WHERE id = p_request_id;

  RETURN json_build_object('success', true, 'message', 'Solicitud rechazada');
END;
$$;
