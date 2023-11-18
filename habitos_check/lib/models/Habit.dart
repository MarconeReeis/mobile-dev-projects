import 'package:hive_flutter/hive_flutter.dart';

part 'Habit.g.dart';

@HiveType(typeId: 0)
class Habit {
  @HiveField(0)
  final String name;

  @HiveField(1)
  final DateTime createdDate;

  Habit(this.name, this.createdDate);
}
