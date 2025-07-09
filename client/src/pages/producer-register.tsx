import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Leaf, User, MapPin, FileText, CheckCircle } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().min(2, "El nombre completo es requerido"),
  phone: z.string().optional(),
  location: z.string().min(2, "La ubicación es requerida"),
  role: z.literal("producer"),
});

const producerSchema = z.object({
  farmName: z.string().min(2, "El nombre de la finca es requerido"),
  description: z.string().optional(),
  location: z.string().min(2, "La ubicación de la finca es requerida"),
  coordinates: z.string().optional(),
  story: z.string().optional(),
  sustainabilityPractices: z.array(z.string()).min(1, "Selecciona al menos una práctica sostenible"),
});

const registrationSchema = userSchema.merge(producerSchema);

type RegistrationForm = z.infer<typeof registrationSchema>;

const sustainabilityOptions = [
  "Agricultura orgánica sin químicos",
  "Riego por goteo eficiente",
  "Compostaje natural",
  "Control biológico de plagas",
  "Rotación de cultivos",
  "Conservación del suelo",
  "Uso de energías renovables",
  "Reciclaje de residuos orgánicos",
  "Protección de biodiversidad",
  "Comercio justo"
];

export default function ProducerRegister() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      role: "producer",
      sustainabilityPractices: [],
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      // First register the user
      const userResponse = await apiRequest("POST", "/api/register", {
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        location: data.location,
        role: data.role,
      });

      const userData = await userResponse.json();
      localStorage.setItem("auth_token", userData.token);

      // Then register as producer
      const producerResponse = await apiRequest("POST", "/api/producers", {
        farmName: data.farmName,
        description: data.description,
        location: data.location,
        coordinates: data.coordinates,
        story: data.story,
        sustainabilityPractices: JSON.stringify(data.sustainabilityPractices),
      }, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });

      return await producerResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Registro exitoso!",
        description: "Tu solicitud ha sido enviada. Te contactaremos pronto para la evaluación.",
      });
      setStep(4); // Success step
    },
    onError: () => {
      toast({
        title: "Error al registrar",
        description: "Hubo un problema con tu registro. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    registerMutation.mutate(data);
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate user info before proceeding
      const userFields = ["username", "email", "password", "fullName", "location"];
      const isValid = userFields.every(field => {
        const value = form.getValues(field as keyof RegistrationForm);
        return value && value.toString().trim() !== "";
      });

      if (!isValid) {
        toast({
          title: "Campos incompletos",
          description: "Por favor completa todos los campos requeridos.",
          variant: "destructive",
        });
        return;
      }
    }

    if (step === 2) {
      // Validate farm info
      const farmFields = ["farmName", "location"];
      const isValid = farmFields.every(field => {
        const value = form.getValues(field as keyof RegistrationForm);
        return value && value.toString().trim() !== "";
      });

      if (!isValid) {
        toast({
          title: "Campos incompletos",
          description: "Por favor completa la información de tu finca.",
          variant: "destructive",
        });
        return;
      }
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center py-12">
            <CheckCircle className="mx-auto text-green-accent mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">¡Registro Exitoso!</h1>
            <p className="text-gray-600 mb-6">
              Tu solicitud ha sido enviada. Nuestro equipo evaluará tu información y te contactaremos pronto.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i <= step ? "bg-green-accent text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {i}
                </div>
                {i < 3 && (
                  <div className={`h-1 w-24 mx-2 ${
                    i < step ? "bg-green-accent" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Información Personal</span>
            <span>Información de Finca</span>
            <span>Sostenibilidad</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-primary">
              <Leaf className="mr-2" size={24} />
              Registro de Productor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center mb-4">
                      <User className="mr-2 text-green-primary" size={20} />
                      <h3 className="text-lg font-semibold">Información Personal</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre completo" {...field} />
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
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="tu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de Usuario *</FormLabel>
                          <FormControl>
                            <Input placeholder="nombre_usuario" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
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
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+57 300 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ciudad, Departamento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center mb-4">
                      <MapPin className="mr-2 text-green-primary" size={20} />
                      <h3 className="text-lg font-semibold">Información de tu Finca</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="farmName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Finca *</FormLabel>
                          <FormControl>
                            <Input placeholder="Finca Los Arrayanes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación de la Finca *</FormLabel>
                          <FormControl>
                            <Input placeholder="Vereda, Municipio, Departamento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción de tu Finca</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Cuéntanos sobre tu finca, qué produces, cuánto tiempo llevas..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="story"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tu Historia</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Comparte tu historia como productor: cómo empezaste, qué te motiva, tus valores..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center mb-4">
                      <FileText className="mr-2 text-green-primary" size={20} />
                      <h3 className="text-lg font-semibold">Prácticas de Sostenibilidad</h3>
                    </div>

                    <p className="text-gray-600 mb-4">
                      Selecciona las prácticas sostenibles que implementas en tu finca:
                    </p>

                    <FormField
                      control={form.control}
                      name="sustainabilityPractices"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 gap-3">
                            {sustainabilityOptions.map((practice) => (
                              <FormField
                                key={practice}
                                control={form.control}
                                name="sustainabilityPractices"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={practice}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(practice)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, practice])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== practice
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {practice}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Anterior
                    </Button>
                  )}

                  {step < 3 ? (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="ml-auto bg-green-primary hover:bg-green-secondary"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registrando..." : "Completar Registro"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
