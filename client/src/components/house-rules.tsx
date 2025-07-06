import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HouseRules() {
  const rules = [
    {
      id: 1,
      icon: "fas fa-broom",
      iconColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      title: "Clean as you go",
      description: "Wash dishes immediately after use and wipe down surfaces"
    },
    {
      id: 2,
      icon: "fas fa-trash",
      iconColor: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      title: "Trash day responsibility",
      description: "Put bins out the night before collection day"
    },
    {
      id: 3,
      icon: "fas fa-users",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200",
      title: "Shared spaces",
      description: "Keep common areas tidy for everyone to enjoy"
    },
    {
      id: 4,
      icon: "fas fa-clock",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-200",
      title: "Complete tasks on time",
      description: "Finish assigned chores by their due date"
    },
    {
      id: 5,
      icon: "fas fa-handshake",
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-200",
      title: "Help when needed",
      description: "Assist others with tasks when you have free time"
    },
    {
      id: 6,
      icon: "fas fa-tools",
      iconColor: "text-gray-600",
      bgColor: "bg-gray-100",
      borderColor: "border-gray-200",
      title: "Report maintenance issues",
      description: "Notify immediately if something needs fixing"
    },
    {
      id: 7,
      icon: "fas fa-moon",
      iconColor: "text-violet-800",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-300",
      title: "U18 curfew",
      description: "Under 18 must be home by 10pm",
      ageGroup: "U18"
    },
    {
      id: 8,
      icon: "fas fa-clock",
      iconColor: "text-cyan-800",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-300",
      title: "18+ curfew",
      description: "18 and over must be home by 12am (midnight)",
      ageGroup: "18+"
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
          {rules.map((rule, index) => (
            <div 
              key={rule.id} 
              className={`relative flex items-start space-x-3 p-4 rounded-lg ${rule.bgColor} border-2 ${rule.borderColor} hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-10 h-10 ${rule.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm`}>
                <i className={`${rule.icon} ${rule.iconColor} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{rule.title}</h3>
                  {rule.ageGroup && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                      rule.ageGroup === "U18" 
                        ? "bg-violet-200 text-violet-800 border border-violet-400" 
                        : "bg-cyan-200 text-cyan-800 border border-cyan-400"
                    }`}>
                      {rule.ageGroup}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}