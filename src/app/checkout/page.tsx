"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  ChevronLeft,
  CreditCard,
  Check,
  Truck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertOrderSchema } from "../../shared/schema";

// Extended validation schema for the checkout form
const checkoutFormSchema = insertOrderSchema.extend({
  sameAsBilling: z.boolean().default(false),
  billingFirstName: z.string().min(1, "First name is required"),
  billingLastName: z.string().min(1, "Last name is required"),
  billingAddress: z.string().min(1, "Address is required"),
  billingCity: z.string().min(1, "City is required"),
  billingState: z.string().min(1, "State is required"),
  billingPostalCode: z.string().min(1, "Postal code is required"),
  billingCountry: z.string().min(1, "Country is required"),
  shippingMethod: z.enum(["standard", "express", "overnight"]),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cartItems, getSubtotal, getTax, getTotal, clearCart, toggleCart } =
    useCart();
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Initialize the form with default values
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      userId: undefined,
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      billingFirstName: "",
      billingLastName: "",
      billingAddress: "",
      billingCity: "",
      billingState: "",
      billingPostalCode: "",
      billingCountry: "",
      sameAsBilling: false,
      shippingMethod: "standard",
      subtotal: getSubtotal().toString(),
      tax: getTax().toString(),
      total: getTotal().toString(),
      status: "pending",
      agreeToTerms: false,
    },
  });

  // Watch for sameAsBilling changes to update billing fields
  const sameAsBilling = form.watch("sameAsBilling");

  useEffect(() => {
    if (sameAsBilling) {
      form.setValue("billingFirstName", form.getValues("firstName"));
      form.setValue("billingLastName", form.getValues("lastName"));
      form.setValue("billingAddress", form.getValues("address"));
      form.setValue("billingCity", form.getValues("city"));
      form.setValue("billingState", form.getValues("state"));
      form.setValue("billingPostalCode", form.getValues("postalCode"));
      form.setValue("billingCountry", form.getValues("country"));
    }
  }, [sameAsBilling, form]);

  // Update form values when cart totals change
  useEffect(() => {
    form.setValue("subtotal", getSubtotal().toString());
    form.setValue("tax", getTax().toString());
    form.setValue("total", getTotal().toString());
  }, [cartItems, form, getSubtotal, getTax, getTotal]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Order creation mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CheckoutFormValues) => {
      // Extract only the fields needed for the order
      const {
        sameAsBilling,
        billingFirstName,
        billingLastName,
        billingAddress,
        billingCity,
        billingState,
        billingPostalCode,
        billingCountry,
        shippingMethod,
        agreeToTerms,
        ...orderFields
      } = orderData;

      // Create order
      const res = await apiRequest("POST", "/api/orders", orderFields);
      const order = await res.json();

      // Add order items
      for (const item of cartItems) {
        await apiRequest("POST", `/api/orders/${order.id}/items`, {
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        });
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      // Show success message
      toast({
        title: "Order Placed Successfully!",
        description:
          "Thank you for your purchase. We'll send you a confirmation email shortly.",
        variant: "default",
      });
      // Clear cart and redirect to success page
      clearCart();
      router.push("/");
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    // If on shipping/billing step, go to payment step
    if (checkoutStep === 1) {
      setCheckoutStep(2);
      window.scrollTo(0, 0);
      return;
    }

    // If on payment step, go to review step
    if (checkoutStep === 2) {
      setCheckoutStep(3);
      window.scrollTo(0, 0);
      return;
    }

    // If on review step, submit the order
    createOrderMutation.mutate(data);
  };

  // Navigate back to previous step
  const goBack = () => {
    if (checkoutStep > 1) {
      setCheckoutStep(checkoutStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Check if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button onClick={() => router.push("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={() => toggleCart()}>
              Cart
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Checkout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Checkout Progress */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="flex items-center relative">
            <div
              className={`rounded-full w-8 h-8 ${
                checkoutStep > 1 ? "bg-blue-600" : "bg-blue-600"
              } text-white flex items-center justify-center`}
            >
              {checkoutStep > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div className="absolute top-0 -ml-4 text-xs font-medium text-blue-600 mt-10 w-16 text-center">
              Cart
            </div>
          </div>
          <div
            className={`flex-auto border-t-2 ${
              checkoutStep >= 2 ? "border-blue-600" : "border-gray-300"
            }`}
          ></div>
          <div className="flex items-center relative">
            <div
              className={`rounded-full w-8 h-8 ${
                checkoutStep > 2
                  ? "bg-blue-600"
                  : checkoutStep === 2
                  ? "bg-blue-600"
                  : "bg-gray-300"
              } ${
                checkoutStep >= 2 ? "text-white" : "text-gray-600"
              } flex items-center justify-center`}
            >
              {checkoutStep > 2 ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <div
              className={`absolute top-0 -ml-12 text-xs font-medium ${
                checkoutStep >= 2 ? "text-blue-600" : "text-gray-500"
              } mt-10 w-24 text-center`}
            >
              Shipping & Billing
            </div>
          </div>
          <div
            className={`flex-auto border-t-2 ${
              checkoutStep >= 3 ? "border-blue-600" : "border-gray-300"
            }`}
          ></div>
          <div className="flex items-center relative">
            <div
              className={`rounded-full w-8 h-8 ${
                checkoutStep > 3
                  ? "bg-blue-600"
                  : checkoutStep === 3
                  ? "bg-blue-600"
                  : "bg-gray-300"
              } ${
                checkoutStep >= 3 ? "text-white" : "text-gray-600"
              } flex items-center justify-center`}
            >
              {checkoutStep > 3 ? <Check className="h-4 w-4" /> : "3"}
            </div>
            <div
              className={`absolute top-0 -ml-8 text-xs font-medium ${
                checkoutStep >= 3 ? "text-blue-600" : "text-gray-500"
              } mt-10 w-16 text-center`}
            >
              Payment
            </div>
          </div>
          <div
            className={`flex-auto border-t-2 ${
              checkoutStep >= 4 ? "border-blue-600" : "border-gray-300"
            }`}
          ></div>
          <div className="flex items-center relative">
            <div
              className={`rounded-full w-8 h-8 ${
                checkoutStep === 4 ? "bg-blue-600" : "bg-gray-300"
              } ${
                checkoutStep === 4 ? "text-white" : "text-gray-600"
              } flex items-center justify-center`}
            >
              "4"
            </div>
            <div
              className={`absolute top-0 -ml-6 text-xs font-medium ${
                checkoutStep === 4 ? "text-blue-600" : "text-gray-500"
              } mt-10 w-12 text-center`}
            >
              Review
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main checkout form */}
            <div className="lg:w-2/3">
              {/* Step 1: Shipping & Billing */}
              {checkoutStep === 1 && (
                <>
                  {/* Shipping Information */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold mb-6">
                      Shipping Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                {...field}
                              >
                                <option value="">Select Country</option>
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="UK">United Kingdom</option>
                                <option value="AU">Australia</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Billing Information</h2>
                      <FormField
                        control={form.control}
                        name="sameAsBilling"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm cursor-pointer">
                              Same as shipping address
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="billingFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={sameAsBilling} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billingLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={sameAsBilling} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="billingAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address *</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={sameAsBilling} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="billingCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={sameAsBilling} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billingPostalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={sameAsBilling} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billingState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={sameAsBilling} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billingCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                {...field}
                                disabled={sameAsBilling}
                              >
                                <option value="">Select Country</option>
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="UK">United Kingdom</option>
                                <option value="AU">Australia</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold mb-6">Shipping Method</h2>
                    <FormField
                      control={form.control}
                      name="shippingMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-4"
                            >
                              <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
                                <RadioGroupItem
                                  value="standard"
                                  id="standard"
                                  className="mt-1 mr-3"
                                />
                                <div>
                                  <FormLabel
                                    htmlFor="standard"
                                    className="font-medium"
                                  >
                                    Standard Shipping
                                  </FormLabel>
                                  <p className="text-gray-500 text-sm">
                                    Delivery in 5-7 business days
                                  </p>
                                  <p className="font-medium mt-1">Free</p>
                                </div>
                              </div>
                              <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
                                <RadioGroupItem
                                  value="express"
                                  id="express"
                                  className="mt-1 mr-3"
                                />
                                <div>
                                  <FormLabel
                                    htmlFor="express"
                                    className="font-medium"
                                  >
                                    Express Shipping
                                  </FormLabel>
                                  <p className="text-gray-500 text-sm">
                                    Delivery in 2-3 business days
                                  </p>
                                  <p className="font-medium mt-1">$12.99</p>
                                </div>
                              </div>
                              <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer">
                                <RadioGroupItem
                                  value="overnight"
                                  id="overnight"
                                  className="mt-1 mr-3"
                                />
                                <div>
                                  <FormLabel
                                    htmlFor="overnight"
                                    className="font-medium"
                                  >
                                    Overnight Shipping
                                  </FormLabel>
                                  <p className="text-gray-500 text-sm">
                                    Delivery the next business day
                                  </p>
                                  <p className="font-medium mt-1">$24.99</p>
                                </div>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* Step 2: Payment */}
              {checkoutStep === 2 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-bold mb-6">
                    Payment Information
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <FormLabel>Card Number *</FormLabel>
                        <div className="relative">
                          <Input
                            placeholder="1234 5678 9012 3456"
                            className="pl-12"
                          />
                          <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                      </div>
                      <div>
                        <FormLabel>Expiration Date *</FormLabel>
                        <Input placeholder="MM / YY" />
                      </div>
                      <div>
                        <FormLabel>CVV *</FormLabel>
                        <Input placeholder="123" />
                      </div>
                      <div className="md:col-span-2">
                        <FormLabel>Name on Card *</FormLabel>
                        <Input placeholder="John Doe" />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-medium mb-4">Payment Options</h3>
                      <div className="flex space-x-4 mb-6">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Visa.svg/1200px-Visa.svg.png"
                          alt="Visa"
                          className="h-8 w-auto"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png"
                          alt="Mastercard"
                          className="h-8 w-auto"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png"
                          alt="PayPal"
                          className="h-8 w-auto"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png"
                          alt="American Express"
                          className="h-8 w-auto"
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the Terms of Service and Privacy
                                Policy
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {checkoutStep === 3 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-bold mb-6">Review Your Order</h2>

                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="font-medium mb-3">Shipping Information</h3>
                      <p>
                        {form.getValues("firstName")}{" "}
                        {form.getValues("lastName")}
                      </p>
                      <p>{form.getValues("address")}</p>
                      <p>
                        {form.getValues("city")}, {form.getValues("state")}{" "}
                        {form.getValues("postalCode")}
                      </p>
                      <p>{form.getValues("country")}</p>
                      <p>Email: {form.getValues("email")}</p>
                      <p>Phone: {form.getValues("phone")}</p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="font-medium mb-3">Payment Information</h3>
                      <p>Credit Card: **** **** **** 1234</p>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="font-medium mb-3">Shipping Method</h3>
                      <p>
                        {form.getValues("shippingMethod") === "standard" &&
                          "Standard Shipping (5-7 business days) - Free"}
                        {form.getValues("shippingMethod") === "express" &&
                          "Express Shipping (2-3 business days) - $12.99"}
                        {form.getValues("shippingMethod") === "overnight" &&
                          "Overnight Shipping (Next business day) - $24.99"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-4">Order Items</h3>
                      <ul className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                          <li key={item.id} className="py-4 flex">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h4>{item.name}</h4>
                                  <p className="ml-4">
                                    $
                                    {(
                                      parseFloat(item.price) * item.quantity
                                    ).toFixed(2)}
                                  </p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  Qty {item.quantity}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>${getSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span>${getTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>${getTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {checkoutStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/products")}
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Continue Shopping
                  </Button>
                )}

                <Button
                  type="submit"
                  className="bg-blue-600 text-white font-medium py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : null}
                  {checkoutStep === 1 && "Continue to Payment"}
                  {checkoutStep === 2 && "Review Order"}
                  {checkoutStep === 3 && "Place Order"}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                {cartItems.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">
                    <p>Your cart is empty</p>
                    <Button
                      onClick={() => router.push("/products")}
                      variant="link"
                      className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-4 flex">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.name}</h3>
                              <p className="ml-4">
                                $
                                {(
                                  parseFloat(item.price) * item.quantity
                                ).toFixed(2)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              Qty {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <ShieldCheck className="text-gray-600 mr-3 h-5 w-5" />
                    <p className="text-gray-600 text-sm">
                      Secure checkout - we protect your personal information
                    </p>
                  </div>
                  <div className="flex items-center mb-4">
                    <Truck className="text-gray-600 mr-3 h-5 w-5" />
                    <div>
                      <h3 className="font-medium">Free Shipping</h3>
                      <p className="text-gray-600 text-sm">
                        Free standard shipping on orders over $50
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <RefreshCw className="text-gray-600 mr-3 h-5 w-5" />
                    <div>
                      <h3 className="font-medium">Easy Returns</h3>
                      <p className="text-gray-600 text-sm">
                        30-day return policy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
