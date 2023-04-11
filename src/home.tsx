import React, { useEffect, useState, useRef } from "react";
import { DateTime } from "luxon";
import styled from "styled-components/native";
import useBudgetData from "./hooks/useBudgetData";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native";

export default function Home() {
  const [user, setUser] = useState("Tom");
  const [spend, setSpend] = useState(0);
  const [excludedFromBudget, setExcludedFromBudget] = useState(0);
  const [budget, setBudget] = useState(1000);
  const [customPeriod, setCustomPeriod] = useState(false);
  const [monthResetDate, setMonthResetDate] = useState(27);

  const { query, mutation } = useBudgetData(user);
  const { data, isLoading, isError } = query;
  const { mutate } = mutation;

  useEffect(() => {
    console.log("data changed", data);
    if (data) {
      setSpend(data.spend || 0);
      setExcludedFromBudget(data.excludedFromBudget || 0);
      setBudget(data.budget || 1000);
      setCustomPeriod(data.customPeriod || false);
      setMonthResetDate(data.monthResetDate || 27);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      mutate({
        userId: user,
        data: {
          spend,
          excludedFromBudget,
          budget,
          customPeriod,
          monthResetDate,
        },
      });
    }
  }, [spend, excludedFromBudget, budget, customPeriod, monthResetDate]);

  const currentDate = DateTime.now();
  let startDate = DateTime.fromObject({
    day: 1,
    month: currentDate.month,
  });

  if (customPeriod && monthResetDate > currentDate.day) {
    startDate = DateTime.fromObject({
      day: monthResetDate,
      month: currentDate.month - 1 < 1 ? 12 : currentDate.month - 1,
      year: currentDate.month - 1 < 1 ? currentDate.year - 1 : currentDate.year,
    });
  }

  if (customPeriod && monthResetDate <= currentDate.day) {
    startDate = DateTime.fromObject({
      day: monthResetDate,
      month: currentDate.month,
    });
  }

  const days = currentDate.diff(startDate, "days").toObject();

  const daysPast = Math.floor(days.days);

  const actualSpend = spend - excludedFromBudget;

  const decimalSpend = actualSpend / budget;
  const percentageSpend = Math.round((actualSpend / budget) * 100);

  const dailyBudget = budget / currentDate.daysInMonth;
  const weeklyBudget = dailyBudget * 7;
  const todaysBudget = dailyBudget * daysPast;
  const decimalBudget = (todaysBudget / budget) * 100;

  let color = "lightgreen";
  let backgroundColor = "#daf8da";

  let diffToBudget = Math.floor(todaysBudget) - actualSpend;
  if (diffToBudget === 0) diffToBudget = false;
  let relativeToBudget = "ahead of";
  if (diffToBudget == 0) relativeToBudget = "spot on your";
  if (diffToBudget < 0) {
    relativeToBudget = "behind your";
    color = "orange";
    backgroundColor = "#ffe4be";
  }
  if (diffToBudget < -99) {
    color = "red";
    backgroundColor = "#ffdbd8";
  }

  const daysLeft = currentDate.daysInMonth - daysPast;
  const newDailyBudget = (budget - actualSpend) / daysLeft;
  const newWeeklyBudget = newDailyBudget * 7;

  const checkbox = useRef(null);

  const dates = [...Array(28).keys()];

  const markerPosition = decimalBudget * 2.77 + 58;

  // useEffect(() => {
  //   checkbox.current.checked = customPeriod;
  // }, [customPeriod]);

  // if (isLoading) return <div>Loading...</div>;

  // if (isError) return <div>Error</div>;

  return (
    <SafeAreaView>
      <Wrapper>
        <TitleWrapper>
          <Title>Budget Tracker</Title>
        </TitleWrapper>
        <Spacer />
        <Content>
          <Label>Your budget</Label>
          <InputWrapper>
            <Input
              value={budget.toString()}
              onChangeText={(number) => setBudget(number)}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </InputWrapper>
          <Spacer />
          <Label>Your total spend</Label>
          <InputWrapper>
            <Input
              value={spend.toString()}
              onChangeText={(number) => setSpend(number)}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </InputWrapper>
          <Spacer />
          <Label>Your excluded spend</Label>
          <InputWrapper>
            <Input
              value={excludedFromBudget.toString()}
              onChangeText={(number) => setExcludedFromBudget(number)}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </InputWrapper>
          <Spacer />
          <Descriptions>
            <SummaryDescription
              tooLight={true}
              color={backgroundColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              <Description>
                You are{" "}
                <Bold color={color}>
                  {diffToBudget && <Bold>£</Bold>}
                  {diffToBudget && Math.abs(diffToBudget)}
                </Bold>{" "}
                {relativeToBudget} budget
              </Description>
            </SummaryDescription>
            <Description>
              You have spent <Bold>£{Math.floor(spend - excludedFromBudget)}</Bold> so far
            </Description>
          </Descriptions>
          <Spacer />
          <Subheading>Initial Budget</Subheading>
          <Description>You can spend £{Math.floor(dailyBudget)} a day</Description>
          <Description>You can spend £{Math.floor(weeklyBudget)} a week</Description>
          <Spacer />
          <Subheading>Progress</Subheading>
          <Description>
            You are <Bold>{daysPast}</Bold> days into your budget period
          </Description>
          <Description>
            You have <Bold>{daysLeft}</Bold> days left
          </Description>
          <Description>
            You have spent <Bold>{percentageSpend}%</Bold> of your budget
          </Description>
          <Description>
            Your budget up to today is <Bold>£{Math.floor(todaysBudget)}</Bold>
          </Description>
          <Spacer />
          {diffToBudget > 20 && daysLeft > 0 && (
            <>
              <Subheading>Future</Subheading>
              <Description>You can now spend £{Math.floor(newDailyBudget)} a day</Description>
            </>
          )}
          {diffToBudget < -20 && daysLeft > 0 && (
            <>
              <Subheading>Future</Subheading>
              <Description>Try to spend less than £{Math.floor(newDailyBudget)} day</Description>
            </>
          )}
          {daysLeft == 0 && diffToBudget > 1 && (
            <>
              <Subheading>Future</Subheading>
              <Description>You have £{Math.floor(budget - actualSpend)} left to spend today!</Description>
            </>
          )}
        </Content>
      </Wrapper>
    </SafeAreaView>
  );
}

const Wrapper = styled.View``;

const TitleWrapper = styled.View`
  padding: 20px 20px 15px 20px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: rgba(0, 0, 0, 0.1);
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.8);
`;

const Spacer = styled.View`
  height: 20px;
`;

const Content = styled.View`
  padding: 20px;
`;

const InputWrapper = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Label = styled.Text`
  margin-right: 10px;
  margin-bottom: 4px;
  font-size: 16px;
  color: #333;
`;

const Input = styled.TextInput`
  height: 40px;
  font-size: 16px;
  color: #333;
  /* padding: 10px 5px; */
  background-color: #ffffff;
  border-radius: 10px;
  border-width: 1px;
  border-color: #d9d9d9;
  border-radius: 10px;
  width: 60%;
  padding-left: 10px;
`;

const Description = styled.Text`
  font-size: 14px;
  text-align: center;
`;

const Bold = styled.Text`
  font-weight: bold;
`;

const SummaryDescription = styled.View`
  padding: 10px 20px;
  font-size: 14px;
  background-color: ${(props) => props.color};
  border-radius: 12px;
  margin-top: 8px;
  margin-bottom: 20px;
  color: ${(props) => (props.tooLight ? "black" : "white")};
`;

const Descriptions = styled.View`
  align-items: center;
`;

const Subheading = styled.Text`
  font-weight: 500;
  font-size: 18px;
  margin-bottom: 7px;
  text-align: center;
`;
