import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HouseRules() {
  const rules = [
    {
      id: 1,
      icon: "fas fa-broom",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      title: "Clean as you go",
      description: "Wash dishes immediately after use and wipe down surfaces"
    },
    {
      id: 2,
      icon: "fas fa-trash",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      title: "Trash day responsibility",
      description: "Put bins out the night before collection day"
    },
    {
      id: 3,
      icon: "fas fa-users",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      title: "Shared spaces",
      description: "Keep common areas tidy for everyone to enjoy"
    },
    {
      id: 4,
      icon: "fas fa-clock",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      title: "Complete tasks on time",
      description: "Finish assigned chores by their due date"
    },
    {
      id: 5,
      icon: "fas fa-handshake",
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
      title: "Help when needed",
      description: "Assist others with tasks when you have free time"
    },
    {
      id: 6,
      icon: "fas fa-tools",
      iconColor: "text-gray-600",
      bgColor: "bg-gray-100",
      title: "Report maintenance issues",
      description: "Notify immediately if something needs fixing"
    }
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-xl font-bold text-fc-dark flex items-center">
          <i className="fas fa-list-ul text-fc-red mr-3"></i>
          House Rules
        </CardTitle>
        <p className="text-gray-600">Guidelines for maintaining a harmonious household</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className={`w-10 h-10 ${rule.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${rule.icon} ${rule.iconColor} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{rule.title}</h3>
                <p className="text-sm text-gray-600">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}