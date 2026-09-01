"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CakeOrderStatus = exports.KOTStatus = exports.TableStatus = exports.StockMovementType = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = exports.OrderType = exports.SubscriptionStatus = exports.SubscriptionPlan = exports.UserRole = exports.BusinessType = void 0;
var BusinessType;
(function (BusinessType) {
    BusinessType["RESTAURANT"] = "RESTAURANT";
    BusinessType["CAFE"] = "CAFE";
    BusinessType["BAKERY"] = "BAKERY";
    BusinessType["RETAIL"] = "RETAIL";
})(BusinessType || (exports.BusinessType = BusinessType = {}));
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "OWNER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["CASHIER"] = "CASHIER";
    UserRole["WAITER"] = "WAITER";
    UserRole["KITCHEN_STAFF"] = "KITCHEN_STAFF";
    UserRole["INVENTORY_STAFF"] = "INVENTORY_STAFF";
})(UserRole || (exports.UserRole = UserRole = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["FREE_TRIAL"] = "FREE_TRIAL";
    SubscriptionPlan["STARTER"] = "STARTER";
    SubscriptionPlan["PROFESSIONAL"] = "PROFESSIONAL";
    SubscriptionPlan["ENTERPRISE"] = "ENTERPRISE";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["TRIAL"] = "TRIAL";
    SubscriptionStatus["PAST_DUE"] = "PAST_DUE";
    SubscriptionStatus["CANCELLED"] = "CANCELLED";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["DINE_IN"] = "DINE_IN";
    OrderType["TAKEAWAY"] = "TAKEAWAY";
    OrderType["DELIVERY"] = "DELIVERY";
    OrderType["RETAIL_SALE"] = "RETAIL_SALE";
    OrderType["BAKERY_ORDER"] = "BAKERY_ORDER";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["SERVED"] = "SERVED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["UNPAID"] = "UNPAID";
    PaymentStatus["PARTIAL"] = "PARTIAL";
    PaymentStatus["PAID"] = "PAID";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["UPI"] = "UPI";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["POINTS"] = "POINTS";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var StockMovementType;
(function (StockMovementType) {
    StockMovementType["PURCHASE"] = "PURCHASE";
    StockMovementType["SALE"] = "SALE";
    StockMovementType["RETURN"] = "RETURN";
    StockMovementType["ADJUSTMENT"] = "ADJUSTMENT";
    StockMovementType["WASTE"] = "WASTE";
})(StockMovementType || (exports.StockMovementType = StockMovementType = {}));
var TableStatus;
(function (TableStatus) {
    TableStatus["AVAILABLE"] = "AVAILABLE";
    TableStatus["OCCUPIED"] = "OCCUPIED";
    TableStatus["RESERVED"] = "RESERVED";
})(TableStatus || (exports.TableStatus = TableStatus = {}));
var KOTStatus;
(function (KOTStatus) {
    KOTStatus["PENDING"] = "PENDING";
    KOTStatus["PREPARING"] = "PREPARING";
    KOTStatus["READY"] = "READY";
    KOTStatus["SERVED"] = "SERVED";
})(KOTStatus || (exports.KOTStatus = KOTStatus = {}));
var CakeOrderStatus;
(function (CakeOrderStatus) {
    CakeOrderStatus["RECEIVED"] = "RECEIVED";
    CakeOrderStatus["PREPARING"] = "PREPARING";
    CakeOrderStatus["READY"] = "READY";
    CakeOrderStatus["DELIVERED"] = "DELIVERED";
    CakeOrderStatus["CANCELLED"] = "CANCELLED";
})(CakeOrderStatus || (exports.CakeOrderStatus = CakeOrderStatus = {}));
