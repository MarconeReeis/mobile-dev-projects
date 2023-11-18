import 'package:flutter/material.dart';
import 'package:habitos_check/models/Habit.dart';
import 'package:habitos_check/screens/HomePage.dart';
import 'package:habitos_check/theme/ThemeApp.dart';
import 'package:hive_flutter/hive_flutter.dart';

void main() async {
  initializeHive();
  runApp(const HabitosCheckApp());
}

initializeHive() async {
  try {
    await Hive.initFlutter();
    Hive.registerAdapter(HabitAdapter());
    await Hive.openBox('habits');
  } catch (e) {
    print("Erro ao inicializar Hive: $e");
  }
}

class HabitosCheckApp extends StatefulWidget {
  const HabitosCheckApp({super.key});

  @override
  State<HabitosCheckApp> createState() => _HabitosCheckAppState();
}

class _HabitosCheckAppState extends State<HabitosCheckApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: AppTheme.themeData,
      home: const HomePage(),
    );
  }
}
